-- 1) Knowledge-check grading is API-only (service role). Anon clients must not call grade RPC directly.
-- 2) Shared HTTP rate-limit bucket store for server routes (service role).

create table private.http_rate_limit_events (
  id bigint generated always as identity primary key,
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index http_rate_limit_events_bucket_created_idx
  on private.http_rate_limit_events (bucket_key, created_at desc);

revoke all on table private.http_rate_limit_events
  from public, anon, authenticated, service_role;

create function private.consume_http_rate_limit(
  p_bucket_key text,
  p_max_events integer default 30,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_bucket_key is null or length(trim(p_bucket_key)) < 1 then
    return false;
  end if;

  if p_max_events < 1 or p_window_seconds < 1 then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('http_rate_limit:' || p_bucket_key, 0)
  );

  delete from private.http_rate_limit_events event
  where event.created_at < now() - make_interval(secs => p_window_seconds);

  select count(*)::integer
  into v_count
  from private.http_rate_limit_events event
  where event.bucket_key = p_bucket_key
    and event.created_at >= now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max_events then
    return false;
  end if;

  insert into private.http_rate_limit_events (bucket_key)
  values (p_bucket_key);

  return true;
end;
$$;

create function public.consume_http_rate_limit(
  p_bucket_key text,
  p_max_events integer default 30,
  p_window_seconds integer default 60
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select private.consume_http_rate_limit($1, $2, $3);
$$;

revoke all on function private.consume_http_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function private.consume_http_rate_limit(text, integer, integer)
  to service_role;

revoke all on function public.consume_http_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_http_rate_limit(text, integer, integer)
  to service_role;

revoke all on function public.grade_knowledge_check(text, jsonb) from anon, authenticated;
grant execute on function public.grade_knowledge_check(text, jsonb) to service_role;
