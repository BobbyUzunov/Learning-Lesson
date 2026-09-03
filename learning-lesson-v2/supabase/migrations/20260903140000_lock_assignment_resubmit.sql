-- Lock assignment resubmit: only missing/draft/needs_changes may become submitted.
-- Preserve prior teacher reviews in a private history table before they are cleared.

create table if not exists private.assignment_submission_review_history (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  assignment_id uuid not null references public.classroom_assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  teacher_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  deliverable_text text,
  deliverable_url text,
  event_type text not null,
  actor_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint assignment_submission_review_history_status_check
    check (status in ('draft', 'submitted', 'approved', 'needs_changes')),
  constraint assignment_submission_review_history_event_check
    check (event_type in ('teacher_review', 'cleared_on_resubmit'))
);

create index if not exists assignment_submission_review_history_submission_idx
  on private.assignment_submission_review_history (submission_id, created_at desc);

revoke all on table private.assignment_submission_review_history
  from public, anon, authenticated;

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
  v_current_status text;
  v_teacher_note text;
  v_reviewed_by uuid;
  v_reviewed_at timestamptz;
  v_previous_text text;
  v_previous_url text;
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

  select
    submission.id,
    submission.status,
    submission.teacher_note,
    submission.reviewed_by,
    submission.reviewed_at,
    submission.deliverable_text,
    submission.deliverable_url
  into
    v_submission_id,
    v_current_status,
    v_teacher_note,
    v_reviewed_by,
    v_reviewed_at,
    v_previous_text,
    v_previous_url
  from public.assignment_submissions submission
  where submission.assignment_id = p_assignment_id
    and submission.student_id = v_user_id
  for update;

  -- Only first submit (no row / draft) or a returned needs_changes may become submitted.
  if v_submission_id is not null and v_current_status not in ('draft', 'needs_changes') then
    raise exception 'assignment_closed';
  end if;

  if v_submission_id is not null and v_current_status = 'needs_changes' then
    insert into private.assignment_submission_review_history (
      submission_id,
      assignment_id,
      student_id,
      status,
      teacher_note,
      reviewed_by,
      reviewed_at,
      deliverable_text,
      deliverable_url,
      event_type,
      actor_id
    )
    values (
      v_submission_id,
      p_assignment_id,
      v_user_id,
      v_current_status,
      v_teacher_note,
      v_reviewed_by,
      v_reviewed_at,
      v_previous_text,
      v_previous_url,
      'cleared_on_resubmit',
      v_user_id
    );
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
  v_student_id uuid;
  v_current_status text;
  v_note text := nullif(btrim(coalesce(p_teacher_note, '')), '');
  v_reviewed_at timestamptz;
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

  select
    submission.assignment_id,
    submission.student_id,
    submission.status,
    assignment.classroom_id
  into
    v_assignment_id,
    v_student_id,
    v_current_status,
    v_classroom_id
  from public.assignment_submissions submission
  join public.classroom_assignments assignment on assignment.id = submission.assignment_id
  where submission.id = p_submission_id
  for update of submission;

  if v_assignment_id is null then
    raise exception 'submission_not_found';
  end if;

  if not (select private.is_classroom_teacher(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_current_status not in ('submitted', 'approved', 'needs_changes') then
    raise exception 'not_ready_for_review';
  end if;

  v_reviewed_at := now();

  update public.assignment_submissions submission
  set
    status = p_status,
    teacher_note = v_note,
    reviewed_by = v_user_id,
    reviewed_at = v_reviewed_at
  where submission.id = p_submission_id;

  insert into private.assignment_submission_review_history (
    submission_id,
    assignment_id,
    student_id,
    status,
    teacher_note,
    reviewed_by,
    reviewed_at,
    deliverable_text,
    deliverable_url,
    event_type,
    actor_id
  )
  select
    submission.id,
    submission.assignment_id,
    submission.student_id,
    submission.status,
    submission.teacher_note,
    submission.reviewed_by,
    submission.reviewed_at,
    submission.deliverable_text,
    submission.deliverable_url,
    'teacher_review',
    v_user_id
  from public.assignment_submissions submission
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
