-- Fix PL/pgSQL ambiguity: RETURNS TABLE output names (classroom_id, name)
-- collide with classroom_members / classrooms columns inside join_classroom.

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

  insert into public.classroom_members as member (classroom_id, student_id)
  values (v_id, v_user_id)
  on conflict (classroom_id, student_id) do nothing;

  insert into public.join_code_attempts (user_id, attempted_code, success)
  values (v_user_id, v_code, true);

  return query select v_id, v_name, null::text;
end;
$$;
