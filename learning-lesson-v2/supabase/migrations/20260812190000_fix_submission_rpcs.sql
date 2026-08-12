-- Fix three production submission RPCs discovered by `supabase db lint`:
-- output-column names made two ON CONFLICT targets ambiguous in PL/pgSQL,
-- and PostgreSQL does not provide jsonb_object_length(jsonb).

create or replace function private.submit_project(
  p_project_id text,
  p_notes text,
  p_repo_url text,
  p_deploy_url text
)
returns table(ok boolean, project_id text, status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_project public.course_projects%rowtype;
  v_existing_status text;
  v_notes text := trim(coalesce(p_notes, ''));
  v_repo_url text := nullif(trim(coalesce(p_repo_url, '')), '');
  v_deploy_url text := nullif(trim(coalesce(p_deploy_url, '')), '');
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_project
  from public.course_projects project
  where project.id = p_project_id;

  if v_project.id is null then
    raise exception 'unknown_project';
  end if;

  if not exists (
    select 1
    from public.user_progress progress
    where progress.user_id = v_user_id
      and progress.lesson_id = v_project.after_lesson_id
      and progress.completed
  ) then
    raise exception 'project_locked';
  end if;

  if char_length(v_notes) < v_project.brief_min_length then
    raise exception 'brief_too_short';
  end if;

  if char_length(v_notes) > 10000 then
    raise exception 'brief_too_long';
  end if;

  if v_project.requires_repo and v_repo_url is null then
    raise exception 'repo_required';
  end if;

  if v_project.requires_deploy and v_deploy_url is null then
    raise exception 'deploy_required';
  end if;

  if v_repo_url is not null and (
    char_length(v_repo_url) > 2048 or v_repo_url !~* '^https?://'
  ) then
    raise exception 'invalid_repo_url';
  end if;

  if v_deploy_url is not null and (
    char_length(v_deploy_url) > 2048 or v_deploy_url !~* '^https?://'
  ) then
    raise exception 'invalid_deploy_url';
  end if;

  -- Serialize submissions for the same learner/project so two concurrent
  -- requests cannot race past the capstone status check.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_project_id, 0)
  );

  select submission.status
  into v_existing_status
  from public.project_submissions submission
  where submission.user_id = v_user_id
    and submission.project_id = p_project_id
  for update;

  if v_project.type = 'capstone' and v_existing_status in ('submitted', 'approved') then
    raise exception 'submission_locked';
  end if;

  insert into public.project_submissions (
    user_id,
    project_id,
    notes,
    repo_url,
    deploy_url,
    submitted_at,
    status,
    review_notes,
    reviewed_at,
    reviewed_by
  ) values (
    v_user_id,
    p_project_id,
    v_notes,
    v_repo_url,
    v_deploy_url,
    now(),
    'submitted',
    null,
    null,
    null
  )
  on conflict on constraint project_submissions_user_id_project_id_key do update
  set
    notes = excluded.notes,
    repo_url = excluded.repo_url,
    deploy_url = excluded.deploy_url,
    submitted_at = excluded.submitted_at,
    status = 'submitted',
    review_notes = null,
    reviewed_at = null,
    reviewed_by = null;

  return query select true, p_project_id, 'submitted'::text;
end;
$$;

create or replace function private.submit_assignment(
  p_assignment_id uuid,
  p_deliverable_text text,
  p_deliverable_url text
)
returns table(
  id uuid,
  assignment_id uuid,
  status text,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
  v_text text := nullif(btrim(coalesce(p_deliverable_text, '')), '');
  v_url text := nullif(btrim(coalesce(p_deliverable_url, '')), '');
  v_submission_id uuid;
  v_submitted_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assignment.classroom_id into v_classroom_id
  from public.classroom_assignments assignment
  where assignment.id = p_assignment_id;

  if v_classroom_id is null then
    raise exception 'assignment_not_found';
  end if;

  if not (select private.is_classroom_member(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_text is null and v_url is null then
    raise exception 'deliverable_required';
  end if;

  if v_text is not null and char_length(v_text) > 10000 then
    raise exception 'invalid_deliverable_text';
  end if;

  if v_url is not null and char_length(v_url) > 2000 then
    raise exception 'invalid_deliverable_url';
  end if;

  if v_url is not null and v_url !~* '^https?://' then
    raise exception 'invalid_deliverable_url';
  end if;

  v_submitted_at := now();

  insert into public.assignment_submissions (
    assignment_id,
    student_id,
    status,
    deliverable_text,
    deliverable_url,
    teacher_note,
    reviewed_by,
    submitted_at,
    reviewed_at
  )
  values (
    p_assignment_id,
    v_user_id,
    'submitted',
    v_text,
    v_url,
    null,
    null,
    v_submitted_at,
    null
  )
  on conflict on constraint assignment_submissions_assignment_id_student_id_key do update
  set
    status = 'submitted',
    deliverable_text = excluded.deliverable_text,
    deliverable_url = excluded.deliverable_url,
    teacher_note = null,
    reviewed_by = null,
    submitted_at = excluded.submitted_at,
    reviewed_at = null
  returning assignment_submissions.id into v_submission_id;

  return query
  select
    submission.id,
    submission.assignment_id,
    submission.status,
    submission.submitted_at
  from public.assignment_submissions submission
  where submission.id = v_submission_id;
end;
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
  v_answer_count integer;
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

  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object' then
    raise exception 'invalid_answers';
  end if;

  select count(*), coalesce(sum(question.points), 0)
  into v_question_count, v_max_score
  from public.assessment_questions question
  where question.assessment_id = p_assessment_id;

  select count(*)::integer
  into v_answer_count
  from pg_catalog.jsonb_object_keys(p_answers);

  if v_question_count < 2 or v_answer_count <> v_question_count then
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
