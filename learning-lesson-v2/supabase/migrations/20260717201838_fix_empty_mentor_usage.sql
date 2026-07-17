-- A SELECT ... INTO with no matching usage row can overwrite the initialized
-- counter with NULL. Use scalar subqueries so a new user always receives a
-- numeric zero and keep a safe fallback if the settings row is ever missing.

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

  select coalesce((
    select settings.daily_limit
    from private.mentor_settings settings
    where settings.singleton
  ), 5)
  into v_limit;

  select coalesce((
    select usage.request_count
    from public.mentor_daily_usage usage
    where usage.user_id = v_user_id
      and usage.usage_date = v_today
  ), 0)
  into v_count;

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

  select coalesce((
    select settings.daily_limit
    from private.mentor_settings settings
    where settings.singleton
  ), 5)
  into v_limit;

  insert into public.mentor_daily_usage (user_id, usage_date, request_count)
  values (v_user_id, v_today, 1)
  on conflict (user_id, usage_date) do update
  set request_count = public.mentor_daily_usage.request_count + 1
  where public.mentor_daily_usage.request_count < v_limit
  returning public.mentor_daily_usage.request_count into v_count;

  if v_count is null then
    select coalesce((
      select usage.request_count
      from public.mentor_daily_usage usage
      where usage.user_id = v_user_id
        and usage.usage_date = v_today
    ), v_limit)
    into v_count;

    return query select false, v_count, 0, v_limit;
    return;
  end if;

  return query select true, v_count, greatest(v_limit - v_count, 0), v_limit;
end;
$$;

revoke all on function private.get_mentor_usage() from public, anon;
revoke all on function private.reserve_mentor_hint() from public, anon;
grant execute on function private.get_mentor_usage() to authenticated;
grant execute on function private.reserve_mentor_hint() to authenticated;
