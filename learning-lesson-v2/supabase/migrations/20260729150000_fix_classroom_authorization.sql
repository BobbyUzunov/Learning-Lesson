-- Close classroom authorization gaps without rewriting applied migrations.
-- Expected join failures are returned as data so their rate-limit records commit.

create index if not exists join_code_attempts_created_at_idx
  on public.join_code_attempts (created_at);

-- Refuse to install over inconsistent legacy data. An administrator must first
-- promote the affected owner/co-teacher or transfer/remove their classroom role.
do $$
begin
  if exists (
    select 1
    from public.classrooms classroom
    join public.profiles profile on profile.id = classroom.teacher_id
    where profile.role not in ('teacher', 'admin')
  ) or exists (
    select 1
    from public.classroom_teachers teacher
    join public.profiles profile on profile.id = teacher.user_id
    where profile.role not in ('teacher', 'admin')
  ) then
    raise exception 'classroom_teacher_role_inconsistency';
  end if;
end;
$$;

create or replace function private.is_classroom_teacher(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_admin())
  or exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'teacher'
      and (
        exists (
          select 1
          from public.classroom_teachers teacher
          where teacher.classroom_id = p_classroom_id
            and teacher.user_id = profile.id
        )
        or exists (
          select 1
          from public.classrooms classroom
          where classroom.id = p_classroom_id
            and classroom.teacher_id = profile.id
        )
      )
  );
$$;

create or replace function private.is_classroom_owner(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_admin())
  or exists (
    select 1
    from public.classrooms classroom
    join public.profiles profile on profile.id = classroom.teacher_id
    where classroom.id = p_classroom_id
      and classroom.teacher_id = (select auth.uid())
      and profile.role = 'teacher'
  );
$$;

revoke all on function private.is_classroom_teacher(uuid) from public, anon;
revoke all on function private.is_classroom_owner(uuid) from public, anon;
grant execute on function private.is_classroom_teacher(uuid) to authenticated, service_role;
grant execute on function private.is_classroom_owner(uuid) to authenticated, service_role;

drop policy if exists "Members and teacher can read classrooms" on public.classrooms;
create policy "Members and teacher can read classrooms"
on public.classrooms for select to authenticated
using (
  (select private.is_classroom_teacher(id))
  or (select private.is_classroom_member(id))
);

drop policy if exists "Teachers members admin can read classroom_teachers" on public.classroom_teachers;
create policy "Teachers members admin can read classroom_teachers"
on public.classroom_teachers for select to authenticated
using (
  (select private.is_classroom_teacher(classroom_id))
  or (select private.is_classroom_member(classroom_id))
);

create or replace function private.prevent_classroom_teacher_demotion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role not in ('teacher', 'admin')
    and old.role in ('teacher', 'admin')
    and (
      exists (
        select 1 from public.classrooms classroom
        where classroom.teacher_id = old.id
      )
      or exists (
        select 1 from public.classroom_teachers teacher
        where teacher.user_id = old.id
      )
    ) then
    raise exception 'teacher_has_classrooms';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_classroom_teacher_demotion on public.profiles;
create trigger prevent_classroom_teacher_demotion
before update of role on public.profiles
for each row execute function private.prevent_classroom_teacher_demotion();

revoke all on function private.prevent_classroom_teacher_demotion() from public, anon, authenticated;

-- A return row is used for expected failures. Raising after INSERT would roll
-- back the attempt record and make the limiter ineffective.
drop function if exists public.join_classroom(text);
drop function if exists private.join_classroom(text);

create function private.join_classroom(p_join_code text)
returns table(classroom_id uuid, name text, error_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_code text := upper(btrim(coalesce(p_join_code, '')));
  v_id uuid;
  v_name text;
  v_teacher uuid;
  v_status text;
  v_enabled boolean;
  v_failures integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtext('join_classroom'), hashtext(v_user_id::text));

  delete from public.join_code_attempts attempt
  where attempt.created_at < now() - interval '24 hours';

  select count(*)::integer into v_failures
  from public.join_code_attempts attempt
  where attempt.user_id = v_user_id
    and attempt.success = false
    and attempt.created_at > now() - interval '15 minutes';

  if v_failures >= 5 then
    return query select null::uuid, null::text, 'join_rate_limited'::text;
    return;
  end if;

  if v_code !~ '^[A-Z0-9]{6}$' then
    insert into public.join_code_attempts (user_id, attempted_code, success)
    values (v_user_id, left(v_code, 32), false);
    return query select null::uuid, null::text, 'invalid_join_code'::text;
    return;
  end if;

  select classroom.id, classroom.name, classroom.teacher_id, classroom.status, classroom.join_code_enabled
  into v_id, v_name, v_teacher, v_status, v_enabled
  from public.classrooms classroom
  where classroom.join_code = v_code;

  if v_id is null then
    insert into public.join_code_attempts (user_id, attempted_code, success)
    values (v_user_id, v_code, false);
    return query select null::uuid, null::text, 'classroom_not_found'::text;
    return;
  end if;

  if v_status <> 'active' or v_enabled is not true then
    insert into public.join_code_attempts (user_id, attempted_code, success)
    values (v_user_id, v_code, false);
    return query select null::uuid, null::text, 'classroom_unavailable'::text;
    return;
  end if;

  if v_teacher = v_user_id or exists (
    select 1 from public.classroom_teachers teacher
    where teacher.classroom_id = v_id and teacher.user_id = v_user_id
  ) then
    return query select null::uuid, null::text, 'teacher_cannot_join'::text;
    return;
  end if;

  insert into public.classroom_members (classroom_id, student_id)
  values (v_id, v_user_id)
  on conflict (classroom_id, student_id) do nothing;

  insert into public.join_code_attempts (user_id, attempted_code, success)
  values (v_user_id, v_code, true);

  return query select v_id, v_name, null::text;
end;
$$;

create function public.join_classroom(p_join_code text)
returns table(classroom_id uuid, name text, error_code text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.join_classroom($1);
$$;

revoke all on function private.join_classroom(text) from public, anon;
revoke all on function public.join_classroom(text) from public, anon;
grant execute on function private.join_classroom(text) to authenticated;
grant execute on function public.join_classroom(text) to authenticated;

create or replace function private.set_user_role(p_user_id uuid, p_role text)
returns table(user_id uuid, role text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_old_role text;
begin
  if v_admin is null then
    raise exception 'not_authenticated';
  end if;

  if not (select private.is_admin()) then
    raise exception 'admin_required';
  end if;

  if p_role not in ('user', 'teacher') then
    raise exception 'invalid_role';
  end if;

  select profile.role into v_old_role
  from public.profiles profile
  where profile.id = p_user_id;

  if v_old_role is null then
    raise exception 'unknown_user';
  end if;

  if v_old_role = 'admin' then
    raise exception 'admin_role_protected';
  end if;

  if p_role = 'user' and (
    exists (select 1 from public.classrooms classroom where classroom.teacher_id = p_user_id)
    or exists (select 1 from public.classroom_teachers teacher where teacher.user_id = p_user_id)
  ) then
    raise exception 'teacher_has_classrooms';
  end if;

  if v_old_role = p_role then
    return query select p_user_id, p_role;
    return;
  end if;

  update public.profiles profile
  set role = p_role
  where profile.id = p_user_id;

  insert into public.role_change_audit (actor_id, target_user_id, old_role, new_role)
  values (v_admin, p_user_id, v_old_role, p_role);

  return query select p_user_id, p_role;
end;
$$;

revoke all on function private.set_user_role(uuid, text) from public, anon;
grant execute on function private.set_user_role(uuid, text) to authenticated;

create or replace function private.list_classroom_transfer_candidates(p_classroom_id uuid)
returns table(id uuid, label text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  select classroom.teacher_id into v_owner_id
  from public.classrooms classroom
  where classroom.id = p_classroom_id;

  if v_owner_id is null then
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
    and profile.id <> v_owner_id
  order by coalesce(nullif(btrim(profile.display_name), ''), profile.id::text);
end;
$$;

create or replace function public.list_classroom_transfer_candidates(p_classroom_id uuid)
returns table(id uuid, label text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.list_classroom_transfer_candidates($1);
$$;

revoke all on function private.list_classroom_transfer_candidates(uuid) from public, anon;
revoke all on function public.list_classroom_transfer_candidates(uuid) from public, anon;
grant execute on function private.list_classroom_transfer_candidates(uuid) to authenticated;
grant execute on function public.list_classroom_transfer_candidates(uuid) to authenticated;

create or replace function private.get_pending_teacher_reviews()
returns table(
  classroom_id uuid,
  classroom_name text,
  assignment_id uuid,
  mission_title text,
  mission_title_bg text,
  pending_count bigint
)
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
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role in ('teacher', 'admin')
  ) then
    raise exception 'teacher_required';
  end if;

  return query
  select
    classroom.id,
    classroom.name,
    assignment.id,
    mission.title,
    mission.title_bg,
    count(submission.id)::bigint
  from public.classrooms classroom
  join public.classroom_assignments assignment on assignment.classroom_id = classroom.id
  join public.curriculum_missions mission on mission.id = assignment.mission_id
  join public.assignment_submissions submission
    on submission.assignment_id = assignment.id
   and submission.status = 'submitted'
  where (select private.is_classroom_teacher(classroom.id))
  group by classroom.id, classroom.name, assignment.id, mission.title, mission.title_bg
  order by min(submission.submitted_at) nulls last, classroom.name, mission.title;
end;
$$;

create or replace function public.get_pending_teacher_reviews()
returns table(
  classroom_id uuid,
  classroom_name text,
  assignment_id uuid,
  mission_title text,
  mission_title_bg text,
  pending_count bigint
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_pending_teacher_reviews();
$$;

revoke all on function private.get_pending_teacher_reviews() from public, anon;
revoke all on function public.get_pending_teacher_reviews() from public, anon;
grant execute on function private.get_pending_teacher_reviews() to authenticated;
grant execute on function public.get_pending_teacher_reviews() to authenticated;

comment on function public.join_classroom(text) is
  'Joins a classroom and returns error_code for expected failures so rate-limit writes are committed.';
comment on function public.list_classroom_transfer_candidates(uuid) is
  'Returns the minimal transfer candidate identity visible to a classroom owner or admin.';
comment on function public.get_pending_teacher_reviews() is
  'Returns pending assignment review counts in one authorized aggregate query.';
