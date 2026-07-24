-- Teacher and classroom foundation: classes, join codes, student rosters, and a
-- teacher-scoped progress report. The 'teacher' role is granted by admins.

-- 1) Allow the new 'teacher' role on profiles.
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'teacher', 'admin')) not valid;

-- 2) Role helper mirroring private.is_admin(); teachers and admins pass.
create or replace function private.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role in ('teacher', 'admin')
  );
$$;

revoke all on function private.is_teacher() from public, anon;
grant execute on function private.is_teacher() to authenticated, service_role;

-- 3) Tables
create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  specialty_id text references public.specialties(id) on delete set null,
  grade_level smallint not null default 8,
  join_code text not null unique,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classrooms_name_check check (char_length(btrim(name)) between 1 and 120),
  constraint classrooms_description_check check (description is null or char_length(description) <= 500),
  constraint classrooms_grade_check check (grade_level between 8 and 12),
  constraint classrooms_join_code_check check (join_code ~ '^[A-Z0-9]{6}$')
);

create table if not exists public.classroom_members (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (classroom_id, student_id)
);

create index if not exists classrooms_teacher_id_idx on public.classrooms (teacher_id);
create index if not exists classroom_members_classroom_id_idx on public.classroom_members (classroom_id);
create index if not exists classroom_members_student_id_idx on public.classroom_members (student_id);

drop trigger if exists set_classrooms_updated_at on public.classrooms;
create trigger set_classrooms_updated_at
before update on public.classrooms
for each row execute function public.set_updated_at();

-- 4) RLS membership helpers. These are SECURITY DEFINER so they bypass RLS and
-- avoid infinite recursion between the classrooms and classroom_members policies.
create or replace function private.is_classroom_teacher(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.classrooms classroom
    where classroom.id = p_classroom_id
      and classroom.teacher_id = (select auth.uid())
  );
$$;

create or replace function private.is_classroom_member(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.classroom_members member
    where member.classroom_id = p_classroom_id
      and member.student_id = (select auth.uid())
  );
$$;

revoke all on function private.is_classroom_teacher(uuid) from public, anon;
revoke all on function private.is_classroom_member(uuid) from public, anon;
grant execute on function private.is_classroom_teacher(uuid) to authenticated, service_role;
grant execute on function private.is_classroom_member(uuid) to authenticated, service_role;

-- 5) RLS policies
alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;

drop policy if exists "Members and teacher can read classrooms" on public.classrooms;
create policy "Members and teacher can read classrooms"
on public.classrooms for select to authenticated
using (
  (select auth.uid()) = teacher_id
  or (select private.is_admin())
  or (select private.is_classroom_member(id))
);

drop policy if exists "Teachers can update own classrooms" on public.classrooms;
create policy "Teachers can update own classrooms"
on public.classrooms for update to authenticated
using ((select auth.uid()) = teacher_id or (select private.is_admin()))
with check ((select auth.uid()) = teacher_id or (select private.is_admin()));

drop policy if exists "Teacher and student can read membership" on public.classroom_members;
create policy "Teacher and student can read membership"
on public.classroom_members for select to authenticated
using (
  (select auth.uid()) = student_id
  or (select private.is_admin())
  or (select private.is_classroom_teacher(classroom_id))
);

-- 6) Table privileges. Inserts/deletes flow only through the definer RPCs below.
revoke all on table public.classrooms from public, anon;
revoke all on table public.classroom_members from public, anon;
grant select, update on table public.classrooms to authenticated;
grant select on table public.classroom_members to authenticated;

-- 7) Privileged implementations (private) with public invoker wrappers, matching
-- the established RPC boundary pattern.
create or replace function private.create_classroom(
  p_name text,
  p_description text,
  p_specialty_id text,
  p_grade_level integer
)
returns table(id uuid, name text, join_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := btrim(coalesce(p_name, ''));
  v_description text := nullif(btrim(coalesce(p_description, '')), '');
  v_grade integer := coalesce(p_grade_level, 8);
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

  insert into public.classrooms (teacher_id, name, description, specialty_id, grade_level, join_code)
  values (v_user_id, v_name, v_description, p_specialty_id, v_grade, v_code)
  returning classrooms.id into v_id;

  return query select v_id, v_name, v_code;
end;
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
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'invalid_join_code';
  end if;

  select classroom.id, classroom.name, classroom.teacher_id
  into v_id, v_name, v_teacher
  from public.classrooms classroom
  where classroom.join_code = v_code and classroom.archived = false;

  if v_id is null then
    raise exception 'classroom_not_found';
  end if;

  if v_teacher = v_user_id then
    raise exception 'teacher_cannot_join';
  end if;

  insert into public.classroom_members (classroom_id, student_id)
  values (v_id, v_user_id)
  on conflict (classroom_id, student_id) do nothing;

  return query select v_id, v_name;
end;
$$;

create or replace function private.get_classroom_report(p_classroom_id uuid)
returns table(
  student_id uuid,
  display_name text,
  email text,
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

  if not exists (
    select 1 from public.classrooms classroom
    where classroom.id = p_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    member.student_id,
    profile.display_name,
    profile.email,
    coalesce(count(progress.lesson_id) filter (where progress.completed), 0)::integer,
    coalesce(profile.xp, 0)::integer,
    coalesce(profile.level, 1)::integer,
    profile.last_visit,
    member.joined_at
  from public.classroom_members member
  left join public.profiles profile on profile.id = member.student_id
  left join public.user_progress progress on progress.user_id = member.student_id
  where member.classroom_id = p_classroom_id
  group by member.student_id, profile.display_name, profile.email, profile.xp, profile.level, profile.last_visit, member.joined_at
  order by profile.display_name nulls last;
end;
$$;

create or replace function private.set_user_role(p_user_id uuid, p_role text)
returns table(user_id uuid, role text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
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

  if not exists (select 1 from public.profiles profile where profile.id = p_user_id) then
    raise exception 'unknown_user';
  end if;

  update public.profiles profile set role = p_role where profile.id = p_user_id;

  return query select p_user_id, p_role;
end;
$$;

create or replace function public.create_classroom(
  p_name text,
  p_description text,
  p_specialty_id text,
  p_grade_level integer
)
returns table(id uuid, name text, join_code text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_classroom($1, $2, $3, $4);
$$;

create or replace function public.join_classroom(p_join_code text)
returns table(classroom_id uuid, name text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.join_classroom($1);
$$;

create or replace function public.get_classroom_report(p_classroom_id uuid)
returns table(
  student_id uuid,
  display_name text,
  email text,
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

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns table(user_id uuid, role text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.set_user_role($1, $2);
$$;

revoke all on function private.create_classroom(text, text, text, integer) from public, anon;
revoke all on function private.join_classroom(text) from public, anon;
revoke all on function private.get_classroom_report(uuid) from public, anon;
revoke all on function private.set_user_role(uuid, text) from public, anon;

grant execute on function private.create_classroom(text, text, text, integer) to authenticated;
grant execute on function private.join_classroom(text) to authenticated;
grant execute on function private.get_classroom_report(uuid) to authenticated;
grant execute on function private.set_user_role(uuid, text) to authenticated;

revoke all on function public.create_classroom(text, text, text, integer) from public, anon;
revoke all on function public.join_classroom(text) from public, anon;
revoke all on function public.get_classroom_report(uuid) from public, anon;
revoke all on function public.set_user_role(uuid, text) from public, anon;

grant execute on function public.create_classroom(text, text, text, integer) to authenticated;
grant execute on function public.join_classroom(text) to authenticated;
grant execute on function public.get_classroom_report(uuid) to authenticated;
grant execute on function public.set_user_role(uuid, text) to authenticated;

comment on table public.classrooms is
  'Teacher-owned classes with a join code; students enroll via join_classroom().';
comment on table public.classroom_members is
  'Student enrollment in classrooms; written only through join_classroom().';
