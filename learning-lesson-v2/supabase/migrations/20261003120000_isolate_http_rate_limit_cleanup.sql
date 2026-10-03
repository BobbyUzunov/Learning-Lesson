-- Isolate rate-limit event cleanup per bucket so a short window caller cannot
-- delete still-valid events belonging to longer-window buckets.
create or replace function private.consume_http_rate_limit(
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
  where event.bucket_key = p_bucket_key
    and event.created_at < now() - make_interval(secs => p_window_seconds);

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
