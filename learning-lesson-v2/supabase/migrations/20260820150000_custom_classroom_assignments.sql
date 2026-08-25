-- Teachers can assign a class-only mission with their own open questions.
-- Catalog missions stay on curriculum_missions; custom rows use a null mission_id.

alter table public.classroom_assignments
  add column if not exists custom_questions jsonb not null default '[]'::jsonb;

alter table public.classroom_assignments
  alter column mission_id drop not null;

alter table public.classroom_assignments
  drop constraint if exists classroom_assignments_source_check;

alter table public.classroom_assignments
  add constraint classroom_assignments_source_check
  check (
    (
      mission_id is not null
      and custom_questions = '[]'::jsonb
    )
    or (
      mission_id is null
      and title_override is not null
      and jsonb_typeof(custom_questions) = 'array'
      and jsonb_array_length(custom_questions) between 1 and 8
    )
  );

comment on column public.classroom_assignments.custom_questions is
  'Open questions for a teacher-authored mission; empty for catalog missions.';
comment on table public.classroom_assignments is
  'Teacher-assigned catalog missions or class-only custom missions with open questions.';

create or replace function private.create_custom_classroom_assignment(
  p_classroom_id uuid,
  p_title text,
  p_questions jsonb,
  p_due_at timestamptz,
  p_instructions text
)
returns table(
  id uuid,
  classroom_id uuid,
  mission_id text,
  title_override text,
  custom_questions jsonb,
  due_at timestamptz,
  instructions text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_instructions text := nullif(btrim(coalesce(p_instructions, '')), '');
  v_title text := nullif(btrim(coalesce(p_title, '')), '');
  v_questions jsonb;
  v_id uuid;
  v_item jsonb;
  v_text text;
  v_normalized text[] := '{}';
  v_index integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not (select private.is_classroom_teacher(p_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_title is null or char_length(v_title) < 3 or char_length(v_title) > 200 then
    raise exception 'invalid_title';
  end if;

  if v_instructions is not null and char_length(v_instructions) > 2000 then
    raise exception 'invalid_instructions';
  end if;

  if p_questions is null or jsonb_typeof(p_questions) is distinct from 'array' then
    raise exception 'invalid_questions';
  end if;

  if jsonb_array_length(p_questions) < 1 or jsonb_array_length(p_questions) > 8 then
    raise exception 'invalid_questions';
  end if;

  for v_index in 0 .. jsonb_array_length(p_questions) - 1 loop
    v_item := p_questions -> v_index;
    if jsonb_typeof(v_item) is distinct from 'string' then
      raise exception 'invalid_questions';
    end if;

    v_text := btrim(v_item #>> '{}');
    if char_length(v_text) < 3 or char_length(v_text) > 400 then
      raise exception 'invalid_questions';
    end if;

    v_normalized := array_append(v_normalized, v_text);
  end loop;

  if coalesce(array_length(v_normalized, 1), 0) < 1 then
    raise exception 'invalid_questions';
  end if;

  v_questions := to_jsonb(v_normalized);

  insert into public.classroom_assignments (
    classroom_id, mission_id, assigned_by, title_override, instructions, due_at, custom_questions
  )
  values (
    p_classroom_id, null, v_user_id, v_title, v_instructions, p_due_at, v_questions
  )
  returning classroom_assignments.id into v_id;

  return query
  select
    assignment.id,
    assignment.classroom_id,
    assignment.mission_id,
    assignment.title_override,
    assignment.custom_questions,
    assignment.due_at,
    assignment.instructions,
    assignment.created_at
  from public.classroom_assignments assignment
  where assignment.id = v_id;
end;
$$;

create or replace function public.create_custom_classroom_assignment(
  p_classroom_id uuid,
  p_title text,
  p_questions jsonb,
  p_due_at timestamptz,
  p_instructions text
)
returns table(
  id uuid,
  classroom_id uuid,
  mission_id text,
  title_override text,
  custom_questions jsonb,
  due_at timestamptz,
  instructions text,
  created_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_custom_classroom_assignment($1, $2, $3, $4, $5);
$$;

revoke all on function private.create_custom_classroom_assignment(uuid, text, jsonb, timestamptz, text)
  from public, anon;
revoke all on function public.create_custom_classroom_assignment(uuid, text, jsonb, timestamptz, text)
  from public, anon;
grant execute on function private.create_custom_classroom_assignment(uuid, text, jsonb, timestamptz, text)
  to authenticated;
grant execute on function public.create_custom_classroom_assignment(uuid, text, jsonb, timestamptz, text)
  to authenticated;

-- Custom assignments have no curriculum_missions row; keep them in the review inbox.
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
    coalesce(nullif(btrim(assignment.title_override), ''), mission.title, 'Teacher mission'),
    coalesce(
      nullif(btrim(assignment.title_override), ''),
      mission.title_bg,
      mission.title,
      'Мисия от учителя'
    ),
    count(submission.id)::bigint
  from public.classrooms classroom
  join public.classroom_assignments assignment on assignment.classroom_id = classroom.id
  left join public.curriculum_missions mission on mission.id = assignment.mission_id
  join public.assignment_submissions submission
    on submission.assignment_id = assignment.id
   and submission.status = 'submitted'
  where (select private.is_classroom_teacher(classroom.id))
  group by
    classroom.id,
    classroom.name,
    assignment.id,
    assignment.title_override,
    mission.title,
    mission.title_bg
  order by
    min(submission.submitted_at) nulls last,
    classroom.name,
    coalesce(nullif(btrim(assignment.title_override), ''), mission.title, 'Teacher mission');
end;
$$;
