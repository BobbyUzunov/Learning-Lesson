-- One student name everywhere: profiles.display_name is source of truth.
-- Teacher rename updates the profile and mirrors roster_name on all memberships.
-- Classroom report prefers profile.display_name.

-- 1) Backfill profile from classroom roster when the teacher already corrected the name.
with preferred as (
  select distinct on (member.student_id)
    member.student_id,
    public.sanitize_profile_display_name(member.roster_name) as preferred_name
  from public.classroom_members member
  where nullif(btrim(coalesce(member.roster_name, '')), '') is not null
  order by
    member.student_id,
    char_length(btrim(member.roster_name)) desc,
    member.joined_at desc nulls last
)
update public.profiles profile
set display_name = preferred.preferred_name
from preferred
where profile.id = preferred.student_id
  and preferred.preferred_name is not null
  and preferred.preferred_name is distinct from nullif(btrim(coalesce(profile.display_name, '')), '');

-- 2) Mirror the profile name onto every membership row.
update public.classroom_members member
set roster_name = nullif(btrim(profile.display_name), '')
from public.profiles profile
where profile.id = member.student_id
  and member.roster_name is distinct from nullif(btrim(profile.display_name), '');

-- 3) Teacher rename → profile + all memberships.
create or replace function private.set_classroom_member_name(
  p_classroom_id uuid,
  p_student_id uuid,
  p_roster_name text
)
returns table(classroom_id uuid, student_id uuid, roster_name text, display_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := public.sanitize_profile_display_name(p_roster_name);
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not (select private.is_classroom_teacher(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1
    from public.classroom_members member
    where member.classroom_id = p_classroom_id
      and member.student_id = p_student_id
  ) then
    raise exception 'member_not_found';
  end if;

  -- Empty input keeps the current profile name (no wipe); still re-mirrors roster.
  if v_name is null then
    select public.sanitize_profile_display_name(profile.display_name)
    into v_name
    from public.profiles profile
    where profile.id = p_student_id;
  end if;

  if v_name is not null then
    update public.profiles profile
    set display_name = v_name
    where profile.id = p_student_id;
  end if;

  update public.classroom_members member
  set roster_name = v_name
  where member.student_id = p_student_id;

  return query
  select
    p_classroom_id,
    p_student_id,
    v_name,
    coalesce(
      v_name,
      nullif(btrim(profile.display_name), ''),
      upper(left(replace(p_student_id::text, '-', ''), 8))
    )
  from public.profiles profile
  where profile.id = p_student_id;
end;
$$;

-- 4) Report prefers profile.display_name (source of truth).
create or replace function private.get_classroom_report(p_classroom_id uuid)
returns table(
  student_id uuid,
  display_name text,
  roster_name text,
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
    coalesce(
      nullif(btrim(profile.display_name), ''),
      nullif(btrim(member.roster_name), ''),
      upper(left(replace(member.student_id::text, '-', ''), 8))
    ) as display_name,
    member.roster_name,
    coalesce(count(progress.lesson_id) filter (where progress.completed), 0)::integer,
    coalesce(profile.xp, 0)::integer,
    coalesce(profile.level, 1)::integer,
    profile.last_visit,
    member.joined_at
  from public.classroom_members member
  left join public.profiles profile on profile.id = member.student_id
  left join public.user_progress progress on progress.user_id = member.student_id
  where member.classroom_id = p_classroom_id
  group by
    member.student_id,
    member.roster_name,
    profile.display_name,
    profile.xp,
    profile.level,
    profile.last_visit,
    member.joined_at
  order by
    coalesce(
      nullif(btrim(profile.display_name), ''),
      nullif(btrim(member.roster_name), ''),
      member.student_id::text
    );
end;
$$;

-- 5) On join, seed roster_name from the profile display name.
create or replace function private.join_classroom(p_join_code text)
returns table(classroom_id uuid, name text, error_code text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_user_id uuid := (select auth.uid());
  v_code text := upper(btrim(coalesce(p_join_code, '')));
  v_id uuid;
  v_name text;
  v_teacher uuid;
  v_status text;
  v_enabled boolean;
  v_failures integer;
  v_roster text;
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

  select public.sanitize_profile_display_name(profile.display_name)
  into v_roster
  from public.profiles profile
  where profile.id = v_user_id;

  insert into public.classroom_members as member (classroom_id, student_id, roster_name)
  values (v_id, v_user_id, v_roster)
  on conflict (classroom_id, student_id) do nothing;

  insert into public.join_code_attempts (user_id, attempted_code, success)
  values (v_user_id, v_code, true);

  return query select v_id, v_name, null::text;
end;
$$;

comment on column public.classroom_members.roster_name is
  'Mirror of profiles.display_name for the student. Updated with the profile when a teacher renames.';
