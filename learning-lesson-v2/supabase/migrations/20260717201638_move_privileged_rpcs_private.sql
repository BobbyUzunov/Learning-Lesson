-- Keep the production PostgREST RPC surface stable while moving privileged
-- implementations out of the exposed public schema.

alter table public.mentor_settings set schema private;

drop policy if exists "No direct client access" on private.mentor_settings;
create policy "No direct client access"
on private.mentor_settings
for all
to authenticated
using (false)
with check (false);

revoke all on private.mentor_settings from public, anon, authenticated;

alter function public.complete_lesson(text, jsonb) set schema private;
alter function public.merge_guest_progress(text[]) set schema private;
alter function public.record_daily_visit() set schema private;
alter function public.submit_project(text, text, text, text) set schema private;
alter function public.get_mentor_usage() set schema private;
alter function public.reserve_mentor_hint() set schema private;

-- These two implementations read the mentor limit, which now lives in the
-- private schema. The remaining implementations already use fully-qualified
-- public table names and need no body changes.
create or replace function private.get_mentor_usage()
returns table(request_count integer, remaining integer, daily_limit integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_today date := (timezone('utc', now()))::date;
  v_limit integer := 5;
  v_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select settings.daily_limit into v_limit
  from private.mentor_settings settings
  where settings.singleton;

  select coalesce(usage.request_count, 0) into v_count
  from public.mentor_daily_usage usage
  where usage.user_id = v_user_id and usage.usage_date = v_today;

  return query select v_count, greatest(v_limit - v_count, 0), v_limit;
end;
$$;

create or replace function private.reserve_mentor_hint()
returns table(ok boolean, request_count integer, remaining integer, daily_limit integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_today date := (timezone('utc', now()))::date;
  v_limit integer := 5;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select settings.daily_limit into v_limit
  from private.mentor_settings settings
  where settings.singleton;

  insert into public.mentor_daily_usage (user_id, usage_date, request_count)
  values (v_user_id, v_today, 1)
  on conflict (user_id, usage_date) do update
  set request_count = public.mentor_daily_usage.request_count + 1
  where public.mentor_daily_usage.request_count < v_limit
  returning public.mentor_daily_usage.request_count into v_count;

  if v_count is null then
    select usage.request_count into v_count
    from public.mentor_daily_usage usage
    where usage.user_id = v_user_id and usage.usage_date = v_today;

    return query select false, coalesce(v_count, v_limit), 0, v_limit;
    return;
  end if;

  return query select true, v_count, greatest(v_limit - v_count, 0), v_limit;
end;
$$;

-- Public functions are now narrow invoker wrappers. PostgREST keeps the same
-- function names and signatures, while all privileged code stays private.
create function public.complete_lesson(p_lesson_id text, p_answers jsonb)
returns table(ok boolean, xp integer, level integer)
language sql
security invoker
set search_path = ''
as $$
  select * from private.complete_lesson($1, $2);
$$;

create function public.merge_guest_progress(p_lesson_ids text[])
returns table(ok boolean, xp integer, level integer)
language sql
security invoker
set search_path = ''
as $$
  select * from private.merge_guest_progress($1);
$$;

create function public.record_daily_visit()
returns table(streak integer, last_visit date)
language sql
security invoker
set search_path = ''
as $$
  select * from private.record_daily_visit();
$$;

create function public.submit_project(
  p_project_id text,
  p_notes text,
  p_repo_url text,
  p_deploy_url text
)
returns table(ok boolean, project_id text, status text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.submit_project($1, $2, $3, $4);
$$;

create function public.get_mentor_usage()
returns table(request_count integer, remaining integer, daily_limit integer)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_mentor_usage();
$$;

create function public.reserve_mentor_hint()
returns table(ok boolean, request_count integer, remaining integer, daily_limit integer)
language sql
security invoker
set search_path = ''
as $$
  select * from private.reserve_mentor_hint();
$$;

revoke all on function private.complete_lesson(text, jsonb) from public, anon;
revoke all on function private.merge_guest_progress(text[]) from public, anon;
revoke all on function private.record_daily_visit() from public, anon;
revoke all on function private.submit_project(text, text, text, text) from public, anon;
revoke all on function private.get_mentor_usage() from public, anon;
revoke all on function private.reserve_mentor_hint() from public, anon;

grant execute on function private.complete_lesson(text, jsonb) to authenticated;
grant execute on function private.merge_guest_progress(text[]) to authenticated;
grant execute on function private.record_daily_visit() to authenticated;
grant execute on function private.submit_project(text, text, text, text) to authenticated;
grant execute on function private.get_mentor_usage() to authenticated;
grant execute on function private.reserve_mentor_hint() to authenticated;

revoke all on function public.complete_lesson(text, jsonb) from public, anon;
revoke all on function public.merge_guest_progress(text[]) from public, anon;
revoke all on function public.record_daily_visit() from public, anon;
revoke all on function public.submit_project(text, text, text, text) from public, anon;
revoke all on function public.get_mentor_usage() from public, anon;
revoke all on function public.reserve_mentor_hint() from public, anon;

grant execute on function public.complete_lesson(text, jsonb) to authenticated;
grant execute on function public.merge_guest_progress(text[]) to authenticated;
grant execute on function public.record_daily_visit() to authenticated;
grant execute on function public.submit_project(text, text, text, text) to authenticated;
grant execute on function public.get_mentor_usage() to authenticated;
grant execute on function public.reserve_mentor_hint() to authenticated;

comment on schema private is
  'Internal application objects that are not exposed through the Data API.';

comment on table private.mentor_settings is
  'Server-managed mentor limits; clients access them only through public RPC wrappers.';

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
