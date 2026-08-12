-- The classrooms.grade_level column is smallint, while the public teacher RPC
-- contract returns integer. PL/pgSQL requires an exact result type match.

create or replace function private.list_teacher_classrooms()
returns table (
  id uuid,
  teacher_id uuid,
  name text,
  description text,
  specialty_id text,
  grade_level integer,
  academic_year text,
  status text,
  join_code text,
  join_code_enabled boolean,
  created_at timestamptz,
  member_count integer
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
    classroom.id,
    classroom.teacher_id,
    classroom.name,
    classroom.description,
    classroom.specialty_id,
    classroom.grade_level::integer,
    classroom.academic_year,
    classroom.status,
    classroom.join_code,
    classroom.join_code_enabled,
    classroom.created_at,
    coalesce(
      (
        select count(*)::integer
        from public.classroom_members member
        where member.classroom_id = classroom.id
      ),
      0
    ) as member_count
  from public.classrooms classroom
  where (select private.is_classroom_teacher(classroom.id))
  order by classroom.created_at desc;
end;
$$;

create or replace function private.get_teacher_classroom(p_classroom_id uuid)
returns table (
  id uuid,
  teacher_id uuid,
  name text,
  description text,
  specialty_id text,
  grade_level integer,
  academic_year text,
  status text,
  join_code text,
  join_code_enabled boolean,
  created_at timestamptz,
  member_count integer
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
    classroom.id,
    classroom.teacher_id,
    classroom.name,
    classroom.description,
    classroom.specialty_id,
    classroom.grade_level::integer,
    classroom.academic_year,
    classroom.status,
    classroom.join_code,
    classroom.join_code_enabled,
    classroom.created_at,
    coalesce(
      (
        select count(*)::integer
        from public.classroom_members member
        where member.classroom_id = classroom.id
      ),
      0
    ) as member_count
  from public.classrooms classroom
  where classroom.id = p_classroom_id;
end;
$$;
