-- Co-teachers can already read their classrooms through private.is_classroom_teacher().
-- Keep the same authorization boundary for the classwork RPCs they operate.

create or replace function private.create_classroom_assignment(
  p_classroom_id uuid,
  p_mission_id text,
  p_due_at timestamptz,
  p_instructions text
)
returns table(
  id uuid,
  classroom_id uuid,
  mission_id text,
  due_at timestamptz,
  instructions text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_instructions text := nullif(btrim(coalesce(p_instructions, '')), '');
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not (select private.is_classroom_teacher(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1 from public.curriculum_missions mission where mission.id = p_mission_id
  ) then
    raise exception 'unknown_mission';
  end if;

  if v_instructions is not null and char_length(v_instructions) > 2000 then
    raise exception 'invalid_instructions';
  end if;

  insert into public.classroom_assignments (
    classroom_id, mission_id, assigned_by, instructions, due_at
  )
  values (p_classroom_id, p_mission_id, v_user_id, v_instructions, p_due_at)
  returning classroom_assignments.id into v_id;

  return query
  select
    assignment.id,
    assignment.classroom_id,
    assignment.mission_id,
    assignment.due_at,
    assignment.instructions,
    assignment.created_at
  from public.classroom_assignments assignment
  where assignment.id = v_id;
exception
  when unique_violation then
    raise exception 'assignment_exists';
end;
$$;

create or replace function private.review_assignment_submission(
  p_submission_id uuid,
  p_status text,
  p_teacher_note text
)
returns table(
  id uuid,
  assignment_id uuid,
  status text,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_assignment_id uuid;
  v_classroom_id uuid;
  v_current_status text;
  v_note text := nullif(btrim(coalesce(p_teacher_note, '')), '');
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_status not in ('approved', 'needs_changes') then
    raise exception 'invalid_status';
  end if;

  if p_status = 'needs_changes' and (v_note is null or char_length(v_note) < 5) then
    raise exception 'teacher_note_required';
  end if;

  if v_note is not null and char_length(v_note) > 5000 then
    raise exception 'invalid_teacher_note';
  end if;

  select submission.assignment_id, submission.status, assignment.classroom_id
  into v_assignment_id, v_current_status, v_classroom_id
  from public.assignment_submissions submission
  join public.classroom_assignments assignment on assignment.id = submission.assignment_id
  where submission.id = p_submission_id;

  if v_assignment_id is null then
    raise exception 'submission_not_found';
  end if;

  if not (select private.is_classroom_teacher(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_current_status not in ('submitted', 'approved', 'needs_changes') then
    raise exception 'not_ready_for_review';
  end if;

  update public.assignment_submissions submission
  set
    status = p_status,
    teacher_note = v_note,
    reviewed_by = v_user_id,
    reviewed_at = now()
  where submission.id = p_submission_id;

  return query
  select
    submission.id,
    submission.assignment_id,
    submission.status,
    submission.reviewed_at
  from public.assignment_submissions submission
  where submission.id = p_submission_id;
end;
$$;

create or replace function private.create_classroom_assessment(
  p_classroom_id uuid,
  p_title text,
  p_description text,
  p_assessment_type text,
  p_due_at timestamptz,
  p_duration_minutes integer,
  p_questions jsonb
)
returns table(
  id uuid,
  classroom_id uuid,
  title text,
  assessment_type text,
  status text,
  due_at timestamptz,
  duration_minutes integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_title text := btrim(coalesce(p_title, ''));
  v_description text := nullif(btrim(coalesce(p_description, '')), '');
  v_assessment_id uuid;
  v_question jsonb;
  v_prompt text;
  v_options jsonb;
  v_explanation text;
  v_correct_option integer;
  v_points integer;
  v_position integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
      and classroom.status = 'active'
  ) or not (select private.is_classroom_teacher(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if char_length(v_title) not between 3 and 200 then
    raise exception 'invalid_title';
  end if;

  if v_description is not null and char_length(v_description) > 2000 then
    raise exception 'invalid_description';
  end if;

  if p_assessment_type not in ('diagnostic', 'formative', 'summative') then
    raise exception 'invalid_assessment_type';
  end if;

  if p_duration_minutes is not null and p_duration_minutes not between 5 and 180 then
    raise exception 'invalid_duration';
  end if;

  if jsonb_typeof(p_questions) <> 'array'
    or jsonb_array_length(p_questions) not between 2 and 30 then
    raise exception 'invalid_questions';
  end if;

  insert into public.classroom_assessments (
    classroom_id,
    created_by,
    title,
    description,
    assessment_type,
    status,
    due_at,
    duration_minutes,
    question_count
  )
  values (
    p_classroom_id,
    v_user_id,
    v_title,
    v_description,
    p_assessment_type,
    'published',
    p_due_at,
    p_duration_minutes,
    jsonb_array_length(p_questions)
  )
  returning classroom_assessments.id into v_assessment_id;

  for v_question in select value from jsonb_array_elements(p_questions)
  loop
    if jsonb_typeof(v_question) <> 'object' then
      raise exception 'invalid_question';
    end if;

    v_prompt := btrim(coalesce(v_question ->> 'prompt', ''));
    v_options := v_question -> 'options';
    v_explanation := nullif(btrim(coalesce(v_question ->> 'explanation', '')), '');

    if char_length(v_prompt) not between 3 and 1000 then
      raise exception 'invalid_question_prompt';
    end if;

    if jsonb_typeof(v_options) <> 'array'
      or jsonb_array_length(v_options) not between 2 and 6 then
      raise exception 'invalid_question_options';
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_options) option_value
      where jsonb_typeof(option_value) <> 'string'
        or char_length(btrim(option_value #>> '{}')) not between 1 and 500
    ) then
      raise exception 'invalid_question_options';
    end if;

    if coalesce(v_question ->> 'correctOption', '') !~ '^\d+$' then
      raise exception 'invalid_correct_option';
    end if;
    v_correct_option := (v_question ->> 'correctOption')::integer;

    if v_correct_option < 0 or v_correct_option >= jsonb_array_length(v_options) then
      raise exception 'invalid_correct_option';
    end if;

    if coalesce(v_question ->> 'points', '') = '' then
      v_points := 1;
    elsif (v_question ->> 'points') !~ '^\d+$' then
      raise exception 'invalid_points';
    else
      v_points := (v_question ->> 'points')::integer;
    end if;

    if v_points not between 1 and 100 then
      raise exception 'invalid_points';
    end if;

    if v_explanation is not null and char_length(v_explanation) > 2000 then
      raise exception 'invalid_explanation';
    end if;

    insert into public.assessment_questions (
      assessment_id,
      prompt,
      options,
      correct_option,
      explanation,
      points,
      position
    )
    values (
      v_assessment_id,
      v_prompt,
      v_options,
      v_correct_option,
      v_explanation,
      v_points,
      v_position
    );

    v_position := v_position + 1;
  end loop;

  return query
  select
    assessment.id,
    assessment.classroom_id,
    assessment.title,
    assessment.assessment_type,
    assessment.status,
    assessment.due_at,
    assessment.duration_minutes,
    assessment.created_at
  from public.classroom_assessments assessment
  where assessment.id = v_assessment_id;
end;
$$;

create or replace function private.get_assessment_report(p_assessment_id uuid)
returns table(
  student_id uuid,
  display_name text,
  attempt_id uuid,
  status text,
  score integer,
  max_score integer,
  percentage numeric,
  submitted_at timestamptz,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assessment.classroom_id into v_classroom_id
  from public.classroom_assessments assessment
  where assessment.id = p_assessment_id;

  if v_classroom_id is null then
    raise exception 'assessment_not_found';
  end if;

  if not (select private.is_classroom_teacher(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    member.student_id,
    profile.display_name,
    attempt.id,
    case when attempt.id is null then 'missing' else 'submitted' end::text,
    attempt.score,
    attempt.max_score,
    attempt.percentage,
    attempt.submitted_at,
    member.joined_at
  from public.classroom_members member
  left join public.profiles profile on profile.id = member.student_id
  left join public.assessment_attempts attempt
    on attempt.assessment_id = p_assessment_id
   and attempt.student_id = member.student_id
  where member.classroom_id = v_classroom_id
  order by profile.display_name nulls last, member.joined_at;
end;
$$;

create or replace function private.get_assessment_question_analysis(p_assessment_id uuid)
returns table(
  question_id uuid,
  prompt text,
  question_position integer,
  points integer,
  answered_count bigint,
  correct_count bigint,
  correct_percentage numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assessment.classroom_id into v_classroom_id
  from public.classroom_assessments assessment
  where assessment.id = p_assessment_id;

  if v_classroom_id is null then
    raise exception 'assessment_not_found';
  end if;

  if not (select private.is_classroom_teacher(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    question.id,
    question.prompt,
    question.position,
    question.points,
    count(attempt.id),
    count(attempt.id) filter (
      where (attempt.answers ->> question.id::text)::integer = question.correct_option
    ),
    case
      when count(attempt.id) = 0 then 0::numeric
      else round(
        count(attempt.id) filter (
          where (attempt.answers ->> question.id::text)::integer = question.correct_option
        )::numeric / count(attempt.id)::numeric * 100,
        2
      )
    end
  from public.assessment_questions question
  left join public.assessment_attempts attempt
    on attempt.assessment_id = question.assessment_id
  where question.assessment_id = p_assessment_id
  group by question.id, question.prompt, question.position, question.points
  order by question.position;
end;
$$;

create or replace function private.close_classroom_assessment(p_assessment_id uuid)
returns table(id uuid, status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assessment.classroom_id into v_classroom_id
  from public.classroom_assessments assessment
  where assessment.id = p_assessment_id;

  if v_classroom_id is null then
    raise exception 'assessment_not_found';
  end if;

  if not (select private.is_classroom_teacher(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  update public.classroom_assessments assessment
  set status = 'closed'
  where assessment.id = p_assessment_id;

  return query
  select assessment.id, assessment.status
  from public.classroom_assessments assessment
  where assessment.id = p_assessment_id;
end;
$$;
