-- Serialize first submit per student+assignment. FOR UPDATE cannot lock a missing row,
-- so concurrent first submits could both pass the status check and overwrite via ON CONFLICT.
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

  -- Lock the logical submission key before lookup so two first submits cannot race.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'submit_assignment:' || v_user_id::text || ':' || p_assignment_id::text,
      0
    )
  );

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
  where public.assignment_submissions.status in ('draft', 'needs_changes')
  returning public.assignment_submissions.id into v_submission_id;

  if v_submission_id is null then
    raise exception 'assignment_closed';
  end if;

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
