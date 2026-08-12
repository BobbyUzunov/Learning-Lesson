-- Teacher-editable class roster names (students join with email; teachers set readable names).

alter table public.classroom_members
  add column if not exists roster_name text;

comment on column public.classroom_members.roster_name is
  'Optional teacher-set display name for this student in this classroom.';

drop function if exists public.get_classroom_report(uuid);
drop function if exists private.get_classroom_report(uuid);

create function private.get_classroom_report(p_classroom_id uuid)
returns table(
  student_id uuid,
  display_name text,
  email text,
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
      nullif(btrim(member.roster_name), ''),
      nullif(btrim(profile.display_name), ''),
      profile.email
    ) as display_name,
    profile.email,
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
    profile.email,
    profile.xp,
    profile.level,
    profile.last_visit,
    member.joined_at
  order by
    coalesce(
      nullif(btrim(member.roster_name), ''),
      nullif(btrim(profile.display_name), ''),
      profile.email,
      member.student_id::text
    );
end;
$$;

create function public.get_classroom_report(p_classroom_id uuid)
returns table(
  student_id uuid,
  display_name text,
  email text,
  roster_name text,
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

revoke all on function private.get_classroom_report(uuid) from public, anon;
revoke all on function public.get_classroom_report(uuid) from public, anon;
grant execute on function private.get_classroom_report(uuid) to authenticated;
grant execute on function public.get_classroom_report(uuid) to authenticated;

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
  v_name text := nullif(btrim(coalesce(p_roster_name, '')), '');
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not (select private.is_classroom_teacher(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_name is not null and char_length(v_name) > 80 then
    raise exception 'invalid_name';
  end if;

  update public.classroom_members member
  set roster_name = v_name
  where member.classroom_id = p_classroom_id
    and member.student_id = p_student_id;

  if not found then
    raise exception 'member_not_found';
  end if;

  return query
  select
    member.classroom_id,
    member.student_id,
    member.roster_name,
    coalesce(
      nullif(btrim(member.roster_name), ''),
      nullif(btrim(profile.display_name), ''),
      profile.email
    )
  from public.classroom_members member
  left join public.profiles profile on profile.id = member.student_id
  where member.classroom_id = p_classroom_id
    and member.student_id = p_student_id;
end;
$$;

create or replace function public.set_classroom_member_name(
  p_classroom_id uuid,
  p_student_id uuid,
  p_roster_name text
)
returns table(classroom_id uuid, student_id uuid, roster_name text, display_name text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.set_classroom_member_name($1, $2, $3);
$$;

revoke all on function private.set_classroom_member_name(uuid, uuid, text) from public, anon;
revoke all on function public.set_classroom_member_name(uuid, uuid, text) from public, anon;
grant execute on function private.set_classroom_member_name(uuid, uuid, text) to authenticated;
grant execute on function public.set_classroom_member_name(uuid, uuid, text) to authenticated;
