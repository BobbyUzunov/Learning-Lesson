-- Phase 3: classroom knowledge checks with automatic scoring.
-- Correct answers remain behind private RPC implementations until a student submits.

-- 1) Tables
create table public.classroom_assessments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  assessment_type text not null,
  status text not null default 'published',
  due_at timestamptz,
  duration_minutes integer,
  question_count integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classroom_assessments_title_check
    check (char_length(btrim(title)) between 3 and 200),
  constraint classroom_assessments_description_check
    check (description is null or char_length(description) <= 2000),
  constraint classroom_assessments_type_check
    check (assessment_type in ('diagnostic', 'formative', 'summative')),
  constraint classroom_assessments_status_check
    check (status in ('published', 'closed')),
  constraint classroom_assessments_duration_check
    check (duration_minutes is null or duration_minutes between 5 and 180),
  constraint classroom_assessments_question_count_check
    check (question_count between 2 and 30)
);

create table public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.classroom_assessments(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_option integer not null,
  explanation text,
  points integer not null default 1,
  position integer not null,
  created_at timestamptz not null default now(),
  unique (assessment_id, position),
  constraint assessment_questions_prompt_check
    check (char_length(btrim(prompt)) between 3 and 1000),
  constraint assessment_questions_options_check
    check (
      jsonb_typeof(options) = 'array'
      and jsonb_array_length(options) between 2 and 6
    ),
  constraint assessment_questions_correct_option_check
    check (correct_option >= 0 and correct_option < jsonb_array_length(options)),
  constraint assessment_questions_explanation_check
    check (explanation is null or char_length(explanation) <= 2000),
  constraint assessment_questions_points_check
    check (points between 1 and 100),
  constraint assessment_questions_position_check
    check (position >= 0)
);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.classroom_assessments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  score integer not null,
  max_score integer not null,
  percentage numeric(5, 2) not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (assessment_id, student_id),
  constraint assessment_attempts_answers_check check (jsonb_typeof(answers) = 'object'),
  constraint assessment_attempts_score_check check (score >= 0 and score <= max_score),
  constraint assessment_attempts_max_score_check check (max_score > 0),
  constraint assessment_attempts_percentage_check check (percentage between 0 and 100)
);

create index classroom_assessments_classroom_idx
  on public.classroom_assessments (classroom_id, created_at desc);
create index classroom_assessments_created_by_idx
  on public.classroom_assessments (created_by);
create index classroom_assessments_due_idx
  on public.classroom_assessments (classroom_id, due_at)
  where status = 'published';
create index assessment_questions_assessment_idx
  on public.assessment_questions (assessment_id, position);
create index assessment_attempts_assessment_idx
  on public.assessment_attempts (assessment_id, submitted_at desc);
create index assessment_attempts_student_idx
  on public.assessment_attempts (student_id, submitted_at desc);

create trigger set_classroom_assessments_updated_at
before update on public.classroom_assessments
for each row execute function public.set_updated_at();

-- 2) RLS and explicit Data API grants
alter table public.classroom_assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_attempts enable row level security;

create policy "Teacher member admin can read assessments"
on public.classroom_assessments for select to authenticated
using (
  (select private.is_admin())
  or (select private.is_classroom_teacher(classroom_id))
  or (
    status in ('published', 'closed')
    and (select private.is_classroom_member(classroom_id))
  )
);

create policy "Teacher admin can read assessment questions"
on public.assessment_questions for select to authenticated
using (
  (select private.is_admin())
  or exists (
    select 1
    from public.classroom_assessments assessment
    where assessment.id = assessment_id
      and (select private.is_classroom_teacher(assessment.classroom_id))
  )
);

create policy "Student teacher admin can read assessment attempts"
on public.assessment_attempts for select to authenticated
using (
  (select auth.uid()) = student_id
  or (select private.is_admin())
  or exists (
    select 1
    from public.classroom_assessments assessment
    where assessment.id = assessment_id
      and (select private.is_classroom_teacher(assessment.classroom_id))
  )
);

revoke all on table public.classroom_assessments from public, anon, authenticated;
revoke all on table public.assessment_questions from public, anon, authenticated;
revoke all on table public.assessment_attempts from public, anon, authenticated;
grant select on table public.classroom_assessments to authenticated;
grant select on table public.assessment_questions to authenticated;
grant select on table public.assessment_attempts to authenticated;

-- 3) Private implementations
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
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
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

create or replace function private.get_assessment_for_student(p_assessment_id uuid)
returns table(
  assessment_id uuid,
  classroom_id uuid,
  classroom_name text,
  title text,
  description text,
  assessment_type text,
  status text,
  due_at timestamptz,
  duration_minutes integer,
  question_id uuid,
  prompt text,
  options jsonb,
  points integer,
  question_position integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    assessment.id::uuid,
    assessment.classroom_id::uuid,
    classroom.name::text,
    assessment.title::text,
    assessment.description::text,
    assessment.assessment_type::text,
    assessment.status::text,
    assessment.due_at::timestamptz,
    assessment.duration_minutes::integer,
    question.id::uuid,
    question.prompt::text,
    question.options::jsonb,
    question.points::integer,
    question.position::integer
  from public.classroom_assessments assessment
  join public.classrooms classroom on classroom.id = assessment.classroom_id
  join public.assessment_questions question on question.assessment_id = assessment.id
  where assessment.id = p_assessment_id
    and assessment.status in ('published', 'closed')
    and (select auth.uid()) is not null
    and exists (
      select 1
      from public.classroom_members member
      where member.classroom_id = assessment.classroom_id
        and member.student_id = (select auth.uid())
    )
  order by question.position;
$$;

create or replace function private.submit_assessment(
  p_assessment_id uuid,
  p_answers jsonb
)
returns table(
  id uuid,
  assessment_id uuid,
  score integer,
  max_score integer,
  percentage numeric,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
  v_status text;
  v_due_at timestamptz;
  v_question_count integer;
  v_score integer;
  v_max_score integer;
  v_attempt_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assessment.classroom_id, assessment.status, assessment.due_at
  into v_classroom_id, v_status, v_due_at
  from public.classroom_assessments assessment
  where assessment.id = p_assessment_id;

  if v_classroom_id is null then
    raise exception 'assessment_not_found';
  end if;

  if not (select private.is_classroom_member(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_status <> 'published' then
    raise exception 'assessment_closed';
  end if;

  if v_due_at is not null and v_due_at < now() then
    raise exception 'assessment_expired';
  end if;

  if exists (
    select 1
    from public.assessment_attempts attempt
    where attempt.assessment_id = p_assessment_id
      and attempt.student_id = v_user_id
  ) then
    raise exception 'attempt_exists';
  end if;

  if jsonb_typeof(p_answers) <> 'object' then
    raise exception 'invalid_answers';
  end if;

  select count(*), coalesce(sum(question.points), 0)
  into v_question_count, v_max_score
  from public.assessment_questions question
  where question.assessment_id = p_assessment_id;

  if v_question_count < 2 or jsonb_object_length(p_answers) <> v_question_count then
    raise exception 'all_answers_required';
  end if;

  if exists (
    select 1
    from public.assessment_questions question
    where question.assessment_id = p_assessment_id
      and (
        not (p_answers ? question.id::text)
        or coalesce(p_answers ->> question.id::text, '') !~ '^\d+$'
        or (p_answers ->> question.id::text)::integer < 0
        or (p_answers ->> question.id::text)::integer >= jsonb_array_length(question.options)
      )
  ) then
    raise exception 'invalid_answers';
  end if;

  select coalesce(sum(question.points), 0)
  into v_score
  from public.assessment_questions question
  where question.assessment_id = p_assessment_id
    and (p_answers ->> question.id::text)::integer = question.correct_option;

  insert into public.assessment_attempts (
    assessment_id,
    student_id,
    answers,
    score,
    max_score,
    percentage
  )
  values (
    p_assessment_id,
    v_user_id,
    p_answers,
    v_score,
    v_max_score,
    round((v_score::numeric / v_max_score::numeric) * 100, 2)
  )
  returning assessment_attempts.id into v_attempt_id;

  return query
  select
    attempt.id,
    attempt.assessment_id,
    attempt.score,
    attempt.max_score,
    attempt.percentage,
    attempt.submitted_at
  from public.assessment_attempts attempt
  where attempt.id = v_attempt_id;
end;
$$;

create or replace function private.get_assessment_review(p_assessment_id uuid)
returns table(
  question_id uuid,
  prompt text,
  options jsonb,
  selected_option integer,
  correct_option integer,
  is_correct boolean,
  explanation text,
  points integer,
  question_position integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_answers jsonb;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select attempt.answers into v_answers
  from public.assessment_attempts attempt
  where attempt.assessment_id = p_assessment_id
    and attempt.student_id = v_user_id;

  if v_answers is null then
    raise exception 'attempt_not_found';
  end if;

  return query
  select
    question.id,
    question.prompt,
    question.options,
    (v_answers ->> question.id::text)::integer,
    question.correct_option,
    (v_answers ->> question.id::text)::integer = question.correct_option,
    question.explanation,
    question.points,
    question.position
  from public.assessment_questions question
  where question.assessment_id = p_assessment_id
  order by question.position;
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

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = v_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
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

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = v_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
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

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = v_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
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

-- 4) Public security-invoker wrappers
create or replace function public.create_classroom_assessment(
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
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_classroom_assessment($1, $2, $3, $4, $5, $6, $7);
$$;

create or replace function public.get_assessment_for_student(p_assessment_id uuid)
returns table(
  assessment_id uuid,
  classroom_id uuid,
  classroom_name text,
  title text,
  description text,
  assessment_type text,
  status text,
  due_at timestamptz,
  duration_minutes integer,
  question_id uuid,
  prompt text,
  options jsonb,
  points integer,
  question_position integer
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_assessment_for_student($1);
$$;

create or replace function public.submit_assessment(p_assessment_id uuid, p_answers jsonb)
returns table(
  id uuid,
  assessment_id uuid,
  score integer,
  max_score integer,
  percentage numeric,
  submitted_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.submit_assessment($1, $2);
$$;

create or replace function public.get_assessment_review(p_assessment_id uuid)
returns table(
  question_id uuid,
  prompt text,
  options jsonb,
  selected_option integer,
  correct_option integer,
  is_correct boolean,
  explanation text,
  points integer,
  question_position integer
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_assessment_review($1);
$$;

create or replace function public.get_assessment_report(p_assessment_id uuid)
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
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_assessment_report($1);
$$;

create or replace function public.get_assessment_question_analysis(p_assessment_id uuid)
returns table(
  question_id uuid,
  prompt text,
  question_position integer,
  points integer,
  answered_count bigint,
  correct_count bigint,
  correct_percentage numeric
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_assessment_question_analysis($1);
$$;

create or replace function public.close_classroom_assessment(p_assessment_id uuid)
returns table(id uuid, status text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.close_classroom_assessment($1);
$$;

revoke all on function private.create_classroom_assessment(uuid, text, text, text, timestamptz, integer, jsonb) from public, anon;
revoke all on function private.get_assessment_for_student(uuid) from public, anon;
revoke all on function private.submit_assessment(uuid, jsonb) from public, anon;
revoke all on function private.get_assessment_review(uuid) from public, anon;
revoke all on function private.get_assessment_report(uuid) from public, anon;
revoke all on function private.get_assessment_question_analysis(uuid) from public, anon;
revoke all on function private.close_classroom_assessment(uuid) from public, anon;

grant execute on function private.create_classroom_assessment(uuid, text, text, text, timestamptz, integer, jsonb) to authenticated;
grant execute on function private.get_assessment_for_student(uuid) to authenticated;
grant execute on function private.submit_assessment(uuid, jsonb) to authenticated;
grant execute on function private.get_assessment_review(uuid) to authenticated;
grant execute on function private.get_assessment_report(uuid) to authenticated;
grant execute on function private.get_assessment_question_analysis(uuid) to authenticated;
grant execute on function private.close_classroom_assessment(uuid) to authenticated;

revoke all on function public.create_classroom_assessment(uuid, text, text, text, timestamptz, integer, jsonb) from public, anon;
revoke all on function public.get_assessment_for_student(uuid) from public, anon;
revoke all on function public.submit_assessment(uuid, jsonb) from public, anon;
revoke all on function public.get_assessment_review(uuid) from public, anon;
revoke all on function public.get_assessment_report(uuid) from public, anon;
revoke all on function public.get_assessment_question_analysis(uuid) from public, anon;
revoke all on function public.close_classroom_assessment(uuid) from public, anon;

grant execute on function public.create_classroom_assessment(uuid, text, text, text, timestamptz, integer, jsonb) to authenticated;
grant execute on function public.get_assessment_for_student(uuid) to authenticated;
grant execute on function public.submit_assessment(uuid, jsonb) to authenticated;
grant execute on function public.get_assessment_review(uuid) to authenticated;
grant execute on function public.get_assessment_report(uuid) to authenticated;
grant execute on function public.get_assessment_question_analysis(uuid) to authenticated;
grant execute on function public.close_classroom_assessment(uuid) to authenticated;

comment on table public.classroom_assessments is
  'Teacher-created diagnostic, formative, and summative classroom knowledge checks.';
comment on table public.assessment_questions is
  'Multiple-choice questions; correct answers are restricted to teachers and post-submission review RPCs.';
comment on table public.assessment_attempts is
  'One automatically scored assessment attempt per student.';
