-- Phase 1 classroom hardening: academic year, status, join-code controls,
-- co-teacher schema, join rate limits, role-change audit, stricter grants,
-- and privacy-preserving classroom reports (no student email).

-- ---------------------------------------------------------------------------
-- 1) Classroom columns
-- ---------------------------------------------------------------------------
alter table public.classrooms
  add column if not exists academic_year text;

alter table public.classrooms
  add column if not exists status text;

alter table public.classrooms
  add column if not exists join_code_enabled boolean;

update public.classrooms
set
  academic_year = coalesce(academic_year, '2026/2027'),
  status = coalesce(status, case when archived then 'archived' else 'active' end),
  join_code_enabled = coalesce(join_code_enabled, case when archived then false else true end);

alter table public.classrooms
  alter column academic_year set default '2026/2027',
  alter column academic_year set not null,
  alter column status set default 'active',
  alter column status set not null,
  alter column join_code_enabled set default true,
  alter column join_code_enabled set not null;

alter table public.classrooms
  drop constraint if exists classrooms_academic_year_check;
alter table public.classrooms
  add constraint classrooms_academic_year_check
  check (academic_year ~ '^[0-9]{4}/[0-9]{4}$');

alter table public.classrooms
  drop constraint if exists classrooms_status_check;
alter table public.classrooms
  add constraint classrooms_status_check
  check (status in ('active', 'archived'));

alter table public.classrooms drop column if exists archived;

-- ---------------------------------------------------------------------------
-- 2) classroom_teachers (owner + future co_teacher)
-- ---------------------------------------------------------------------------
create table if not exists public.classroom_teachers (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'co_teacher',
  created_at timestamptz not null default now(),
  unique (classroom_id, user_id),
  constraint classroom_teachers_role_check check (role in ('owner', 'co_teacher'))
);

create unique index if not exists classroom_teachers_one_owner_idx
  on public.classroom_teachers (classroom_id)
  where role = 'owner';

create index if not exists classroom_teachers_user_id_idx
  on public.classroom_teachers (user_id);

insert into public.classroom_teachers (classroom_id, user_id, role)
select classroom.id, classroom.teacher_id, 'owner'
from public.classrooms classroom
on conflict (classroom_id, user_id) do update
set role = excluded.role;

alter table public.classroom_teachers enable row level security;

drop policy if exists "Teachers members admin can read classroom_teachers" on public.classroom_teachers;
create policy "Teachers members admin can read classroom_teachers"
on public.classroom_teachers for select to authenticated
using (
  (select private.is_admin())
  or (select auth.uid()) = user_id
  or (select private.is_classroom_teacher(classroom_id))
  or (select private.is_classroom_member(classroom_id))
);

revoke all on table public.classroom_teachers from public, anon;
grant select on table public.classroom_teachers to authenticated;

-- ---------------------------------------------------------------------------
-- 3) join_code_attempts + role_change_audit
-- ---------------------------------------------------------------------------
create table if not exists public.join_code_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_code text not null,
  success boolean not null default false,
  created_at timestamptz not null default now(),
  constraint join_code_attempts_code_check check (char_length(attempted_code) <= 32)
);

create index if not exists join_code_attempts_user_created_idx
  on public.join_code_attempts (user_id, created_at desc);

alter table public.join_code_attempts enable row level security;

drop policy if exists "Users read own join attempts" on public.join_code_attempts;
create policy "Users read own join attempts"
on public.join_code_attempts for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));

revoke all on table public.join_code_attempts from public, anon;
grant select on table public.join_code_attempts to authenticated;

create table if not exists public.role_change_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  old_role text,
  new_role text not null,
  created_at timestamptz not null default now(),
  constraint role_change_audit_new_role_check check (new_role in ('user', 'teacher', 'admin'))
);

create index if not exists role_change_audit_target_idx
  on public.role_change_audit (target_user_id, created_at desc);

alter table public.role_change_audit enable row level security;

drop policy if exists "Admins read role change audit" on public.role_change_audit;
create policy "Admins read role change audit"
on public.role_change_audit for select to authenticated
using ((select private.is_admin()));

revoke all on table public.role_change_audit from public, anon;
grant select on table public.role_change_audit to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Harden table privileges: no direct client UPDATE on classrooms
-- ---------------------------------------------------------------------------
revoke update on table public.classrooms from authenticated;
grant select on table public.classrooms to authenticated;

drop policy if exists "Teachers can update own classrooms" on public.classrooms;

-- ---------------------------------------------------------------------------
-- 5) Membership helper: owners and co-teachers
-- ---------------------------------------------------------------------------
create or replace function private.is_classroom_teacher(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.classroom_teachers teacher
    where teacher.classroom_id = p_classroom_id
      and teacher.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
      and classroom.teacher_id = (select auth.uid())
  )
  or (select private.is_admin());
$$;

revoke all on function private.is_classroom_teacher(uuid) from public, anon;
grant execute on function private.is_classroom_teacher(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 6) Replace create / join / report / set_user_role + new management RPCs
-- ---------------------------------------------------------------------------
drop function if exists public.create_classroom(text, text, text, integer);
drop function if exists private.create_classroom(text, text, text, integer);

create or replace function private.create_classroom(
  p_name text,
  p_description text,
  p_specialty_id text,
  p_grade_level integer,
  p_academic_year text default '2026/2027'
)
returns table(
  id uuid,
  name text,
  join_code text,
  academic_year text,
  grade_level smallint,
  status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := btrim(coalesce(p_name, ''));
  v_description text := nullif(btrim(coalesce(p_description, '')), '');
  v_grade integer := coalesce(p_grade_level, 8);
  v_year text := coalesce(nullif(btrim(coalesce(p_academic_year, '')), ''), '2026/2027');
  v_code text;
  v_id uuid;
  v_attempts integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from public.profiles profile
    where profile.id = v_user_id and profile.role in ('teacher', 'admin')
  ) then
    raise exception 'teacher_required';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'invalid_name';
  end if;

  if v_description is not null and char_length(v_description) > 500 then
    raise exception 'invalid_description';
  end if;

  if v_grade < 8 or v_grade > 12 then
    raise exception 'invalid_grade';
  end if;

  if v_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'invalid_academic_year';
  end if;

  if p_specialty_id is not null and not exists (
    select 1 from public.specialties specialty where specialty.id = p_specialty_id
  ) then
    raise exception 'unknown_specialty';
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (
      select 1 from public.classrooms classroom where classroom.join_code = v_code
    );
    if v_attempts > 25 then
      raise exception 'join_code_generation_failed';
    end if;
  end loop;

  insert into public.classrooms (
    teacher_id, name, description, specialty_id, grade_level, join_code, academic_year, status, join_code_enabled
  )
  values (
    v_user_id, v_name, v_description, p_specialty_id, v_grade, v_code, v_year, 'active', true
  )
  returning classrooms.id into v_id;

  insert into public.classroom_teachers (classroom_id, user_id, role)
  values (v_id, v_user_id, 'owner')
  on conflict (classroom_id, user_id) do update set role = 'owner';

  return query
  select classroom.id, classroom.name, classroom.join_code, classroom.academic_year, classroom.grade_level, classroom.status
  from public.classrooms classroom
  where classroom.id = v_id;
end;
$$;

create or replace function public.create_classroom(
  p_name text,
  p_description text,
  p_specialty_id text,
  p_grade_level integer,
  p_academic_year text default '2026/2027'
)
returns table(
  id uuid,
  name text,
  join_code text,
  academic_year text,
  grade_level smallint,
  status text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_classroom($1, $2, $3, $4, $5);
$$;

create or replace function private.join_classroom(p_join_code text)
returns table(classroom_id uuid, name text)
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

  select count(*)::integer into v_failures
  from public.join_code_attempts attempt
  where attempt.user_id = v_user_id
    and attempt.success = false
    and attempt.created_at > now() - interval '15 minutes';

  if v_failures >= 5 then
    raise exception 'join_rate_limited';
  end if;

  if v_code !~ '^[A-Z0-9]{6}$' then
    insert into public.join_code_attempts (user_id, attempted_code, success)
    values (v_user_id, left(v_code, 32), false);
    raise exception 'invalid_join_code';
  end if;

  select classroom.id, classroom.name, classroom.teacher_id, classroom.status, classroom.join_code_enabled
  into v_id, v_name, v_teacher, v_status, v_enabled
  from public.classrooms classroom
  where classroom.join_code = v_code;

  if v_id is null then
    insert into public.join_code_attempts (user_id, attempted_code, success)
    values (v_user_id, v_code, false);
    raise exception 'classroom_not_found';
  end if;

  if v_status <> 'active' or v_enabled is not true then
    insert into public.join_code_attempts (user_id, attempted_code, success)
    values (v_user_id, v_code, false);
    raise exception 'classroom_unavailable';
  end if;

  if v_teacher = v_user_id or exists (
    select 1 from public.classroom_teachers teacher
    where teacher.classroom_id = v_id and teacher.user_id = v_user_id
  ) then
    raise exception 'teacher_cannot_join';
  end if;

  insert into public.classroom_members (classroom_id, student_id)
  values (v_id, v_user_id)
  on conflict (classroom_id, student_id) do nothing;

  insert into public.join_code_attempts (user_id, attempted_code, success)
  values (v_user_id, v_code, true);

  return query select v_id, v_name;
end;
$$;

create or replace function public.join_classroom(p_join_code text)
returns table(classroom_id uuid, name text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.join_classroom($1);
$$;

-- Reports without email
drop function if exists public.get_classroom_report(uuid);
drop function if exists private.get_classroom_report(uuid);

create or replace function private.get_classroom_report(p_classroom_id uuid)
returns table(
  student_id uuid,
  display_name text,
  completed_lessons integer,
  xp integer,
  level integer,
  last_visit date,
  joined_at timestamptz
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
    profile.display_name,
    coalesce(count(progress.lesson_id) filter (where progress.completed), 0)::integer,
    coalesce(profile.xp, 0)::integer,
    coalesce(profile.level, 1)::integer,
    profile.last_visit,
    member.joined_at
  from public.classroom_members member
  left join public.profiles profile on profile.id = member.student_id
  left join public.user_progress progress on progress.user_id = member.student_id
  where member.classroom_id = p_classroom_id
  group by member.student_id, profile.display_name, profile.xp, profile.level, profile.last_visit, member.joined_at
  order by profile.display_name nulls last;
end;
$$;

create or replace function public.get_classroom_report(p_classroom_id uuid)
returns table(
  student_id uuid,
  display_name text,
  completed_lessons integer,
  xp integer,
  level integer,
  last_visit date,
  joined_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_classroom_report($1);
$$;

drop function if exists public.get_assignment_report(uuid);
drop function if exists private.get_assignment_report(uuid);

create or replace function private.get_assignment_report(p_assignment_id uuid)
returns table(
  student_id uuid,
  display_name text,
  submission_id uuid,
  status text,
  deliverable_text text,
  deliverable_url text,
  teacher_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
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

  select assignment.classroom_id into v_classroom_id
  from public.classroom_assignments assignment
  where assignment.id = p_assignment_id;

  if v_classroom_id is null then
    raise exception 'assignment_not_found';
  end if;

  if not (select private.is_classroom_teacher(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    member.student_id,
    profile.display_name,
    submission.id,
    coalesce(submission.status, 'missing')::text,
    submission.deliverable_text,
    submission.deliverable_url,
    submission.teacher_note,
    submission.submitted_at,
    submission.reviewed_at,
    member.joined_at
  from public.classroom_members member
  left join public.profiles profile on profile.id = member.student_id
  left join public.assignment_submissions submission
    on submission.assignment_id = p_assignment_id
   and submission.student_id = member.student_id
  where member.classroom_id = v_classroom_id
  order by profile.display_name nulls last;
end;
$$;

create or replace function public.get_assignment_report(p_assignment_id uuid)
returns table(
  student_id uuid,
  display_name text,
  submission_id uuid,
  status text,
  deliverable_text text,
  deliverable_url text,
  teacher_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  joined_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_assignment_report($1);
$$;

-- set_user_role with audit
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

  insert into public.role_change_audit (actor_id, target_user_id, old_role, new_role)
  values (v_admin, p_user_id, v_old_role, p_role);

  update public.profiles profile set role = p_role where profile.id = p_user_id;

  return query select p_user_id, p_role;
end;
$$;

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns table(user_id uuid, role text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.set_user_role($1, $2);
$$;

-- Management RPCs
create or replace function private.update_classroom_status(p_classroom_id uuid, p_status text)
returns table(id uuid, status text, join_code_enabled boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_enabled boolean;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_status not in ('active', 'archived') then
    raise exception 'invalid_status';
  end if;

  if not exists (
    select 1 from public.classrooms classroom
    where classroom.id = p_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
    raise exception 'not_authorized';
  end if;

  v_enabled := case when p_status = 'archived' then false else true end;

  update public.classrooms classroom
  set status = p_status, join_code_enabled = v_enabled
  where classroom.id = p_classroom_id;

  return query
  select classroom.id, classroom.status, classroom.join_code_enabled
  from public.classrooms classroom
  where classroom.id = p_classroom_id;
end;
$$;

create or replace function public.update_classroom_status(p_classroom_id uuid, p_status text)
returns table(id uuid, status text, join_code_enabled boolean)
language sql
security invoker
set search_path = ''
as $$
  select * from private.update_classroom_status($1, $2);
$$;

create or replace function private.rotate_classroom_join_code(p_classroom_id uuid)
returns table(id uuid, join_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_code text;
  v_attempts integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from public.classrooms classroom
    where classroom.id = p_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
    raise exception 'not_authorized';
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (
      select 1 from public.classrooms classroom where classroom.join_code = v_code
    );
    if v_attempts > 25 then
      raise exception 'join_code_generation_failed';
    end if;
  end loop;

  update public.classrooms classroom
  set join_code = v_code, join_code_enabled = true
  where classroom.id = p_classroom_id;

  return query select p_classroom_id, v_code;
end;
$$;

create or replace function public.rotate_classroom_join_code(p_classroom_id uuid)
returns table(id uuid, join_code text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.rotate_classroom_join_code($1);
$$;

create or replace function private.set_classroom_join_code_enabled(p_classroom_id uuid, p_enabled boolean)
returns table(id uuid, join_code_enabled boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_status text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from public.classrooms classroom
    where classroom.id = p_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
    raise exception 'not_authorized';
  end if;

  select classroom.status into v_status
  from public.classrooms classroom
  where classroom.id = p_classroom_id;

  if v_status = 'archived' and p_enabled then
    raise exception 'classroom_archived';
  end if;

  update public.classrooms classroom
  set join_code_enabled = coalesce(p_enabled, false)
  where classroom.id = p_classroom_id;

  return query
  select classroom.id, classroom.join_code_enabled
  from public.classrooms classroom
  where classroom.id = p_classroom_id;
end;
$$;

create or replace function public.set_classroom_join_code_enabled(p_classroom_id uuid, p_enabled boolean)
returns table(id uuid, join_code_enabled boolean)
language sql
security invoker
set search_path = ''
as $$
  select * from private.set_classroom_join_code_enabled($1, $2);
$$;

create or replace function private.transfer_classroom(p_classroom_id uuid, p_new_owner_id uuid)
returns table(id uuid, teacher_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_old_owner uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select classroom.teacher_id into v_old_owner
  from public.classrooms classroom
  where classroom.id = p_classroom_id;

  if v_old_owner is null then
    raise exception 'classroom_not_found';
  end if;

  if not (
    v_old_owner = v_user_id
    or (select private.is_admin())
  ) then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1 from public.profiles profile
    where profile.id = p_new_owner_id and profile.role in ('teacher', 'admin')
  ) then
    raise exception 'invalid_new_owner';
  end if;

  update public.classrooms classroom
  set teacher_id = p_new_owner_id
  where classroom.id = p_classroom_id;

  -- Previous owner becomes co_teacher if still listed; new owner is sole owner.
  update public.classroom_teachers teacher
  set role = 'co_teacher'
  where teacher.classroom_id = p_classroom_id
    and teacher.role = 'owner'
    and teacher.user_id <> p_new_owner_id;

  insert into public.classroom_teachers (classroom_id, user_id, role)
  values (p_classroom_id, p_new_owner_id, 'owner')
  on conflict (classroom_id, user_id) do update set role = 'owner';

  delete from public.classroom_members member
  where member.classroom_id = p_classroom_id
    and member.student_id = p_new_owner_id;

  return query select p_classroom_id, p_new_owner_id;
end;
$$;

create or replace function public.transfer_classroom(p_classroom_id uuid, p_new_owner_id uuid)
returns table(id uuid, teacher_id uuid)
language sql
security invoker
set search_path = ''
as $$
  select * from private.transfer_classroom($1, $2);
$$;

-- Grants
revoke all on function private.create_classroom(text, text, text, integer, text) from public, anon;
revoke all on function private.join_classroom(text) from public, anon;
revoke all on function private.get_classroom_report(uuid) from public, anon;
revoke all on function private.get_assignment_report(uuid) from public, anon;
revoke all on function private.set_user_role(uuid, text) from public, anon;
revoke all on function private.update_classroom_status(uuid, text) from public, anon;
revoke all on function private.rotate_classroom_join_code(uuid) from public, anon;
revoke all on function private.set_classroom_join_code_enabled(uuid, boolean) from public, anon;
revoke all on function private.transfer_classroom(uuid, uuid) from public, anon;

grant execute on function private.create_classroom(text, text, text, integer, text) to authenticated;
grant execute on function private.join_classroom(text) to authenticated;
grant execute on function private.get_classroom_report(uuid) to authenticated;
grant execute on function private.get_assignment_report(uuid) to authenticated;
grant execute on function private.set_user_role(uuid, text) to authenticated;
grant execute on function private.update_classroom_status(uuid, text) to authenticated;
grant execute on function private.rotate_classroom_join_code(uuid) to authenticated;
grant execute on function private.set_classroom_join_code_enabled(uuid, boolean) to authenticated;
grant execute on function private.transfer_classroom(uuid, uuid) to authenticated;

revoke all on function public.create_classroom(text, text, text, integer, text) from public, anon;
revoke all on function public.join_classroom(text) from public, anon;
revoke all on function public.get_classroom_report(uuid) from public, anon;
revoke all on function public.get_assignment_report(uuid) from public, anon;
revoke all on function public.set_user_role(uuid, text) from public, anon;
revoke all on function public.update_classroom_status(uuid, text) from public, anon;
revoke all on function public.rotate_classroom_join_code(uuid) from public, anon;
revoke all on function public.set_classroom_join_code_enabled(uuid, boolean) from public, anon;
revoke all on function public.transfer_classroom(uuid, uuid) from public, anon;

grant execute on function public.create_classroom(text, text, text, integer, text) to authenticated;
grant execute on function public.join_classroom(text) to authenticated;
grant execute on function public.get_classroom_report(uuid) to authenticated;
grant execute on function public.get_assignment_report(uuid) to authenticated;
grant execute on function public.set_user_role(uuid, text) to authenticated;
grant execute on function public.update_classroom_status(uuid, text) to authenticated;
grant execute on function public.rotate_classroom_join_code(uuid) to authenticated;
grant execute on function public.set_classroom_join_code_enabled(uuid, boolean) to authenticated;
grant execute on function public.transfer_classroom(uuid, uuid) to authenticated;

comment on column public.classrooms.academic_year is 'School year label, e.g. 2026/2027.';
comment on column public.classrooms.status is 'active or archived; archived classrooms reject joins.';
comment on table public.classroom_teachers is 'Owners and future co-teachers for a classroom.';
comment on table public.join_code_attempts is 'Join-code attempt log used for rate limiting.';
comment on table public.role_change_audit is 'Admin audit trail for teacher role changes.';
