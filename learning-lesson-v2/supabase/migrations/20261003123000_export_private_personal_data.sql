-- Ownership-filtered export of private assignment review history for the caller.
create or replace function private.export_my_assignment_review_history()
returns table (
  id uuid,
  submission_id uuid,
  assignment_id uuid,
  status text,
  teacher_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  deliverable_text text,
  deliverable_url text,
  event_type text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  return query
  select
    history.id,
    history.submission_id,
    history.assignment_id,
    history.status,
    history.teacher_note,
    history.reviewed_by,
    history.reviewed_at,
    history.deliverable_text,
    history.deliverable_url,
    history.event_type,
    history.created_at
  from private.assignment_submission_review_history history
  where history.student_id = v_user_id
  order by history.created_at desc;
end;
$$;

create or replace function public.export_my_assignment_review_history()
returns table (
  id uuid,
  submission_id uuid,
  assignment_id uuid,
  status text,
  teacher_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  deliverable_text text,
  deliverable_url text,
  event_type text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select * from private.export_my_assignment_review_history();
$$;

revoke all on function private.export_my_assignment_review_history()
  from public, anon, authenticated;
grant execute on function private.export_my_assignment_review_history()
  to authenticated, service_role;

revoke all on function public.export_my_assignment_review_history()
  from public, anon;
grant execute on function public.export_my_assignment_review_history()
  to authenticated, service_role;
