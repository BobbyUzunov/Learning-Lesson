create table if not exists public.mentor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default ((timezone('utc', now()))::date),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.mentor_daily_usage enable row level security;

drop policy if exists "Users read own mentor usage" on public.mentor_daily_usage;
create policy "Users read own mentor usage"
on public.mentor_daily_usage
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.get_mentor_usage(p_limit integer)
returns table(request_count integer, remaining integer, daily_limit integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
  v_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_limit is null or p_limit < 1 then
    p_limit := 5;
  end if;

  select coalesce(mdu.request_count, 0)
  into v_count
  from public.mentor_daily_usage mdu
  where mdu.user_id = v_user_id
    and mdu.usage_date = v_today;

  return query
  select
    v_count,
    greatest(p_limit - v_count, 0),
    p_limit;
end;
$$;

create or replace function public.reserve_mentor_hint(p_limit integer)
returns table(ok boolean, request_count integer, remaining integer, daily_limit integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_limit is null or p_limit < 1 then
    p_limit := 5;
  end if;

  insert into public.mentor_daily_usage (user_id, usage_date, request_count)
  values (v_user_id, v_today, 0)
  on conflict (user_id, usage_date) do nothing;

  select mdu.request_count
  into v_count
  from public.mentor_daily_usage mdu
  where mdu.user_id = v_user_id
    and mdu.usage_date = v_today
  for update;

  if v_count >= p_limit then
    return query
    select false, v_count, 0, p_limit;
  end if;

  update public.mentor_daily_usage
  set request_count = request_count + 1
  where user_id = v_user_id
    and usage_date = v_today;

  v_count := v_count + 1;

  return query
  select true, v_count, greatest(p_limit - v_count, 0), p_limit;
end;
$$;

create or replace function public.release_mentor_hint()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  update public.mentor_daily_usage
  set request_count = greatest(request_count - 1, 0)
  where user_id = v_user_id
    and usage_date = v_today;
end;
$$;

revoke all on function public.get_mentor_usage(integer) from public;
revoke all on function public.reserve_mentor_hint(integer) from public;
revoke all on function public.release_mentor_hint() from public;

grant execute on function public.get_mentor_usage(integer) to authenticated;
grant execute on function public.reserve_mentor_hint(integer) to authenticated;
grant execute on function public.release_mentor_hint() to authenticated;
