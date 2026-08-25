-- Close remaining backend holes:
-- 1) public knowledge-check grades must not return answer keys
-- 2) concurrent assessment submits should 409 as attempt_exists
-- 3) handle_new_user must not search an open public path
-- 4) set_user_role is service-role only and records a real actor_id

drop function if exists public.grade_knowledge_check(text, jsonb);

create function public.grade_knowledge_check(p_lesson_id text, p_answers jsonb)
returns table (
  question_id text,
  selected_index integer,
  is_correct boolean,
  explanation text,
  explanation_bg text
)
language sql
security definer
set search_path = ''
as $$
  select
    result.question_id,
    result.selected_index,
    result.is_correct,
    result.explanation,
    result.explanation_bg
  from private.grade_knowledge_check($1, $2) result;
$$;

revoke all on function public.grade_knowledge_check(text, jsonb) from public;
grant execute on function public.grade_knowledge_check(text, jsonb) to anon, authenticated;

create or replace function private.submit_assessment(
  p_assessment_id uuid,
  p_answers jsonb
)
returns table(
  id uuid,
  assessment_id uuid,
  score integer,
  max_score integer,
  percentage numeric,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
  v_status text;
  v_due_at timestamptz;
  v_question_count integer;
  v_answer_count integer;
  v_score integer;
  v_max_score integer;
  v_attempt_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assessment.classroom_id, assessment.status, assessment.due_at
  into v_classroom_id, v_status, v_due_at
  from public.classroom_assessments assessment
  where assessment.id = p_assessment_id;

  if v_classroom_id is null then
    raise exception 'assessment_not_found';
  end if;

  if not (select private.is_classroom_member(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_status <> 'published' then
    raise exception 'assessment_closed';
  end if;

  if v_due_at is not null and v_due_at < now() then
    raise exception 'assessment_expired';
  end if;

  if exists (
    select 1
    from public.assessment_attempts attempt
    where attempt.assessment_id = p_assessment_id
      and attempt.student_id = v_user_id
  ) then
    raise exception 'attempt_exists';
  end if;

  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object' then
    raise exception 'invalid_answers';
  end if;

  select count(*), coalesce(sum(question.points), 0)
  into v_question_count, v_max_score
  from public.assessment_questions question
  where question.assessment_id = p_assessment_id;

  select count(*)::integer
  into v_answer_count
  from pg_catalog.jsonb_object_keys(p_answers);

  if v_question_count < 2 or v_answer_count <> v_question_count then
    raise exception 'all_answers_required';
  end if;

  if exists (
    select 1
    from public.assessment_questions question
    where question.assessment_id = p_assessment_id
      and (
        not (p_answers ? question.id::text)
        or coalesce(p_answers ->> question.id::text, '') !~ '^\d+$'
        or (p_answers ->> question.id::text)::integer < 0
        or (p_answers ->> question.id::text)::integer >= jsonb_array_length(question.options)
      )
  ) then
    raise exception 'invalid_answers';
  end if;

  select coalesce(sum(question.points), 0)
  into v_score
  from public.assessment_questions question
  where question.assessment_id = p_assessment_id
    and (p_answers ->> question.id::text)::integer = question.correct_option;

  insert into public.assessment_attempts (
    assessment_id,
    student_id,
    answers,
    score,
    max_score,
    percentage
  )
  values (
    p_assessment_id,
    v_user_id,
    p_answers,
    v_score,
    v_max_score,
    round((v_score::numeric / v_max_score::numeric) * 100, 2)
  )
  returning assessment_attempts.id into v_attempt_id;

  return query
  select
    attempt.id,
    attempt.assessment_id,
    attempt.score,
    attempt.max_score,
    attempt.percentage,
    attempt.submitted_at
  from public.assessment_attempts attempt
  where attempt.id = v_attempt_id;
exception
  when unique_violation then
    raise exception 'attempt_exists';
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    auth_user_id,
    email,
    display_name,
    role
  )
  values (
    new.id,
    new.id,
    new.email,
    public.derive_profile_display_name(new.raw_user_meta_data, new.email),
    'user'
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    auth_user_id = coalesce(public.profiles.auth_user_id, excluded.auth_user_id),
    display_name = coalesce(excluded.display_name, public.profiles.display_name);

  return new;
exception
  when others then
    raise exception 'handle_new_user failed for %: %', new.id, sqlerrm;
end;
$$;

alter function public.handle_new_user() owner to postgres;
alter function public.handle_new_user() security definer;
grant execute on function public.handle_new_user() to postgres, supabase_auth_admin, service_role;

revoke all on function public.set_user_role(uuid, text) from public, anon, authenticated, service_role;
revoke all on function private.set_user_role(uuid, text) from public, anon, authenticated, service_role;
drop function if exists public.set_user_role(uuid, text);
drop function if exists private.set_user_role(uuid, text);

create function private.set_user_role(
  p_user_id uuid,
  p_role text,
  p_actor_id uuid default null
)
returns table(user_id uuid, role text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := (select auth.uid());
  v_actor uuid;
  v_old_role text;
  v_actor_role text;
begin
  if v_caller is not null then
    if not (select private.is_admin()) then
      raise exception 'admin_required';
    end if;
    if p_actor_id is not null and p_actor_id is distinct from v_caller then
      raise exception 'admin_required';
    end if;
    v_actor := v_caller;
  else
    if p_actor_id is null then
      raise exception 'not_authenticated';
    end if;

    select profile.role into v_actor_role
    from public.profiles profile
    where profile.id = p_actor_id;

    if v_actor_role is distinct from 'admin' then
      raise exception 'admin_required';
    end if;

    v_actor := p_actor_id;
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
  values (v_actor, p_user_id, v_old_role, p_role);

  return query select p_user_id, p_role;
end;
$$;

create function public.set_user_role(
  p_user_id uuid,
  p_role text,
  p_actor_id uuid default null
)
returns table(user_id uuid, role text)
language sql
security definer
set search_path = ''
as $$
  select * from private.set_user_role($1, $2, $3);
$$;

revoke all on function private.set_user_role(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.set_user_role(uuid, text, uuid) from public, anon, authenticated;
grant execute on function private.set_user_role(uuid, text, uuid) to service_role;
grant execute on function public.set_user_role(uuid, text, uuid) to service_role;
