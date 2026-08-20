-- Teachers can read completed lab lessons for students in their classroom.
-- user_progress stays owner-scoped; this RPC is the only teacher access path.

create function private.get_classroom_lab_progress(p_classroom_id uuid)
returns table(
  student_id uuid,
  lesson_id text,
  xp_earned integer,
  completed_at timestamptz
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

  if not (select private.is_classroom_teacher(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    member.student_id,
    progress.lesson_id,
    progress.xp_earned,
    progress.completed_at
  from public.classroom_members member
  inner join public.user_progress progress
    on progress.user_id = member.student_id
   and progress.completed is true
  where member.classroom_id = p_classroom_id
  order by member.student_id, progress.completed_at nulls last, progress.lesson_id;
end;
$$;

create function public.get_classroom_lab_progress(p_classroom_id uuid)
returns table(
  student_id uuid,
  lesson_id text,
  xp_earned integer,
  completed_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_classroom_lab_progress($1);
$$;

revoke all on function private.get_classroom_lab_progress(uuid) from public, anon;
revoke all on function public.get_classroom_lab_progress(uuid) from public, anon;
grant execute on function private.get_classroom_lab_progress(uuid) to authenticated;
grant execute on function public.get_classroom_lab_progress(uuid) to authenticated;
