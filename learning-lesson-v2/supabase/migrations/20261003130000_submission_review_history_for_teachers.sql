-- Teachers can read private review history for submissions in their classrooms.
create or replace function private.get_submission_review_history(p_submission_id uuid)
returns table (
  id uuid,
  submission_id uuid,
  status text,
  teacher_note text,
  deliverable_text text,
  deliverable_url text,
  event_type text,
  reviewed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_classroom_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  select assignment.classroom_id
  into v_classroom_id
  from public.assignment_submissions submission
  join public.classroom_assignments assignment on assignment.id = submission.assignment_id
  where submission.id = p_submission_id;

  if v_classroom_id is null then
    raise exception 'submission_not_found';
  end if;

  if not (select private.is_classroom_teacher(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    history.id,
    history.submission_id,
    history.status,
    history.teacher_note,
    history.deliverable_text,
    history.deliverable_url,
    history.event_type,
    history.reviewed_at,
    history.created_at
  from private.assignment_submission_review_history history
  where history.submission_id = p_submission_id
  order by history.created_at desc;
end;
$$;

create or replace function public.get_submission_review_history(p_submission_id uuid)
returns table (
  id uuid,
  submission_id uuid,
  status text,
  teacher_note text,
  deliverable_text text,
  deliverable_url text,
  event_type text,
  reviewed_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select * from private.get_submission_review_history(p_submission_id);
$$;

revoke all on function private.get_submission_review_history(uuid)
  from public, anon, authenticated;
grant execute on function private.get_submission_review_history(uuid)
  to authenticated, service_role;

revoke all on function public.get_submission_review_history(uuid)
  from public, anon;
grant execute on function public.get_submission_review_history(uuid)
  to authenticated, service_role;
