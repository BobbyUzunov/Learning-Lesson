-- Owner/admin RPCs to list, invite, and remove classroom co-teachers.
-- Writes stay in security-definer functions; classroom_teachers remains select-only.

create or replace function private.list_classroom_teachers(p_classroom_id uuid)
returns table(user_id uuid, role text, label text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
  ) then
    raise exception 'classroom_not_found';
  end if;

  if not (select private.is_classroom_teacher(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    teacher.user_id,
    teacher.role,
    coalesce(
      nullif(btrim(profile.display_name), ''),
      'Teacher ' || left(teacher.user_id::text, 8)
    )::text
  from public.classroom_teachers teacher
  join public.profiles profile on profile.id = teacher.user_id
  where teacher.classroom_id = p_classroom_id
  order by
    case teacher.role when 'owner' then 0 else 1 end,
    coalesce(nullif(btrim(profile.display_name), ''), teacher.user_id::text);
end;
$$;

create or replace function public.list_classroom_teachers(p_classroom_id uuid)
returns table(user_id uuid, role text, label text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.list_classroom_teachers($1);
$$;

create or replace function private.list_classroom_co_teacher_candidates(p_classroom_id uuid)
returns table(id uuid, label text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
  ) then
    raise exception 'classroom_not_found';
  end if;

  if not (select private.is_classroom_owner(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    profile.id,
    coalesce(
      nullif(btrim(profile.display_name), ''),
      'Teacher ' || left(profile.id::text, 8)
    )::text
  from public.profiles profile
  where profile.role in ('teacher', 'admin')
    and not exists (
      select 1
      from public.classroom_teachers teacher
      where teacher.classroom_id = p_classroom_id
        and teacher.user_id = profile.id
    )
    and not exists (
      select 1
      from public.classrooms classroom
      where classroom.id = p_classroom_id
        and classroom.teacher_id = profile.id
    )
  order by coalesce(nullif(btrim(profile.display_name), ''), profile.id::text);
end;
$$;

create or replace function public.list_classroom_co_teacher_candidates(p_classroom_id uuid)
returns table(id uuid, label text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.list_classroom_co_teacher_candidates($1);
$$;

create or replace function private.add_classroom_co_teacher(p_classroom_id uuid, p_user_id uuid)
returns table(user_id uuid, role text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  if v_actor is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
  ) then
    raise exception 'classroom_not_found';
  end if;

  if not (select private.is_classroom_owner(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = p_user_id
      and profile.role in ('teacher', 'admin')
  ) then
    raise exception 'invalid_co_teacher';
  end if;

  if exists (
    select 1
    from public.classroom_teachers teacher
    where teacher.classroom_id = p_classroom_id
      and teacher.user_id = p_user_id
  ) or exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
      and classroom.teacher_id = p_user_id
  ) then
    raise exception 'already_classroom_teacher';
  end if;

  insert into public.classroom_teachers (classroom_id, user_id, role)
  values (p_classroom_id, p_user_id, 'co_teacher');

  delete from public.classroom_members member
  where member.classroom_id = p_classroom_id
    and member.student_id = p_user_id;

  return query select p_user_id, 'co_teacher'::text;
end;
$$;

create or replace function public.add_classroom_co_teacher(p_classroom_id uuid, p_user_id uuid)
returns table(user_id uuid, role text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.add_classroom_co_teacher($1, $2);
$$;

create or replace function private.remove_classroom_co_teacher(p_classroom_id uuid, p_user_id uuid)
returns table(user_id uuid, removed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_role text;
begin
  if v_actor is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
  ) then
    raise exception 'classroom_not_found';
  end if;

  if not (select private.is_classroom_owner(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  select teacher.role into v_role
  from public.classroom_teachers teacher
  where teacher.classroom_id = p_classroom_id
    and teacher.user_id = p_user_id;

  if v_role is null then
    raise exception 'invalid_co_teacher';
  end if;

  if v_role = 'owner' then
    raise exception 'cannot_remove_owner';
  end if;

  delete from public.classroom_teachers teacher
  where teacher.classroom_id = p_classroom_id
    and teacher.user_id = p_user_id
    and teacher.role = 'co_teacher';

  return query select p_user_id, true;
end;
$$;

create or replace function public.remove_classroom_co_teacher(p_classroom_id uuid, p_user_id uuid)
returns table(user_id uuid, removed boolean)
language sql
security invoker
set search_path = ''
as $$
  select * from private.remove_classroom_co_teacher($1, $2);
$$;

revoke all on function private.list_classroom_teachers(uuid) from public, anon;
revoke all on function public.list_classroom_teachers(uuid) from public, anon;
revoke all on function private.list_classroom_co_teacher_candidates(uuid) from public, anon;
revoke all on function public.list_classroom_co_teacher_candidates(uuid) from public, anon;
revoke all on function private.add_classroom_co_teacher(uuid, uuid) from public, anon;
revoke all on function public.add_classroom_co_teacher(uuid, uuid) from public, anon;
revoke all on function private.remove_classroom_co_teacher(uuid, uuid) from public, anon;
revoke all on function public.remove_classroom_co_teacher(uuid, uuid) from public, anon;

grant execute on function private.list_classroom_teachers(uuid) to authenticated;
grant execute on function public.list_classroom_teachers(uuid) to authenticated;
grant execute on function private.list_classroom_co_teacher_candidates(uuid) to authenticated;
grant execute on function public.list_classroom_co_teacher_candidates(uuid) to authenticated;
grant execute on function private.add_classroom_co_teacher(uuid, uuid) to authenticated;
grant execute on function public.add_classroom_co_teacher(uuid, uuid) to authenticated;
grant execute on function private.remove_classroom_co_teacher(uuid, uuid) to authenticated;
grant execute on function public.remove_classroom_co_teacher(uuid, uuid) to authenticated;

comment on function public.list_classroom_teachers(uuid) is
  'Returns owner and co-teacher identities visible to a classroom teacher or admin.';
comment on function public.list_classroom_co_teacher_candidates(uuid) is
  'Returns teacher/admin profiles that an owner or admin can invite as co-teachers.';
comment on function public.add_classroom_co_teacher(uuid, uuid) is
  'Adds a teacher or admin as a classroom co-teacher. Owner/admin only.';
comment on function public.remove_classroom_co_teacher(uuid, uuid) is
  'Removes a co-teacher from a classroom. Never removes the owner.';
