-- Atomic daily quota + per-assignment hint slot reservation (F03).
-- Learners finalize hints through security definer RPCs; direct INSERT is revoked.

alter table public.assignment_mentor_hints
  add column if not exists status text,
  add column if not exists updated_at timestamptz;

update public.assignment_mentor_hints
set
  status = coalesce(status, 'ready'),
  updated_at = coalesce(updated_at, created_at);

alter table public.assignment_mentor_hints
  alter column status set default 'pending',
  alter column status set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.assignment_mentor_hints
  drop constraint if exists assignment_mentor_hints_hint_text_check;

alter table public.assignment_mentor_hints
  alter column hint_text drop not null,
  alter column model drop not null;

alter table public.assignment_mentor_hints
  add constraint assignment_mentor_hints_status_check
    check (status in ('pending', 'ready', 'failed'));

alter table public.assignment_mentor_hints
  add constraint assignment_mentor_hints_hint_text_check
    check (
      hint_text is null
      or char_length(btrim(hint_text)) between 1 and 4000
    );

alter table public.assignment_mentor_hints
  add constraint assignment_mentor_hints_ready_requires_content
    check (
      status <> 'ready'
      or (
        hint_text is not null
        and btrim(hint_text) <> ''
        and model is not null
      )
    );

alter table public.assignment_mentor_hints
  drop constraint if exists assignment_mentor_hints_effort_check;

alter table public.assignment_mentor_hints
  add constraint assignment_mentor_hints_effort_check
    check (effort is null or char_length(effort) <= 12000);

create or replace function private.reserve_assignment_mentor_slot(
  p_assignment_id uuid,
  p_hint_level smallint,
  p_mode text,
  p_effort text
)
returns table(
  outcome text,
  hint_id uuid,
  hint_text text,
  request_count integer,
  remaining integer,
  daily_limit integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_row public.assignment_mentor_hints%rowtype;
  v_ready_count integer := 0;
  v_reserve_ok boolean;
  v_count integer;
  v_remaining integer;
  v_limit integer;
  v_effort text := nullif(left(trim(coalesce(p_effort, '')), 12000), '');
  v_pending_fresh interval := interval '10 minutes';
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_hint_level is null or p_hint_level not between 1 and 3 then
    raise exception 'invalid_hint_level';
  end if;

  if p_mode is null or p_mode not in ('start', 'review', 'explain') then
    raise exception 'invalid_mentor_mode';
  end if;

  if not exists (
    select 1
    from public.classroom_assignments assignment
    where assignment.id = p_assignment_id
      and (select private.is_classroom_member(assignment.classroom_id))
  ) then
    raise exception 'not_authorized';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_user_id::text || ':' || p_assignment_id::text || ':' || p_hint_level::text,
      0
    )
  );

  select count(*)
  into v_ready_count
  from public.assignment_mentor_hints hints
  where hints.user_id = v_user_id
    and hints.assignment_id = p_assignment_id
    and hints.status = 'ready';

  if v_ready_count >= 3 and p_hint_level > v_ready_count then
    outcome := 'task_limit';
    return next;
    return;
  end if;

  if p_hint_level > v_ready_count + 1 then
    raise exception 'invalid_hint_level';
  end if;

  select *
  into v_row
  from public.assignment_mentor_hints hints
  where hints.user_id = v_user_id
    and hints.assignment_id = p_assignment_id
    and hints.hint_level = p_hint_level
  for update;

  select usage.request_count, usage.remaining, usage.daily_limit
  into v_count, v_remaining, v_limit
  from private.get_mentor_usage() usage;

  if v_row.id is not null then
    if v_row.status = 'ready' then
      outcome := 'ready';
      hint_id := v_row.id;
      hint_text := v_row.hint_text;
      request_count := v_count;
      remaining := v_remaining;
      daily_limit := v_limit;
      return next;
      return;
    end if;

    if v_row.status = 'pending'
      and v_row.updated_at > (timezone('utc', now()) - v_pending_fresh) then
      outcome := 'pending';
      hint_id := v_row.id;
      hint_text := null;
      request_count := v_count;
      remaining := v_remaining;
      daily_limit := v_limit;
      return next;
      return;
    end if;

    update public.assignment_mentor_hints hints
    set
      status = 'pending',
      mode = p_mode,
      effort = v_effort,
      hint_text = null,
      model = null,
      input_tokens = null,
      output_tokens = null,
      updated_at = timezone('utc', now())
    where hints.id = v_row.id
    returning hints.id into hint_id;

    outcome := 'reserved';
    hint_text := null;
    request_count := v_count;
    remaining := v_remaining;
    daily_limit := v_limit;
    return next;
    return;
  end if;

  select reserve.ok, reserve.request_count, reserve.remaining, reserve.daily_limit
  into v_reserve_ok, v_count, v_remaining, v_limit
  from private.reserve_mentor_hint() reserve;

  if not coalesce(v_reserve_ok, false) then
    outcome := 'daily_limit';
    hint_id := null;
    hint_text := null;
    request_count := v_count;
    remaining := v_remaining;
    daily_limit := v_limit;
    return next;
    return;
  end if;

  insert into public.assignment_mentor_hints (
    user_id,
    assignment_id,
    hint_level,
    mode,
    effort,
    hint_text,
    model,
    status
  )
  values (
    v_user_id,
    p_assignment_id,
    p_hint_level,
    p_mode,
    v_effort,
    null,
    null,
    'pending'
  )
  returning id into hint_id;

  outcome := 'reserved';
  hint_text := null;
  request_count := v_count;
  remaining := v_remaining;
  daily_limit := v_limit;
  return next;
end;
$$;

create or replace function private.finalize_assignment_mentor_hint(
  p_hint_id uuid,
  p_hint_text text,
  p_model text,
  p_input_tokens integer,
  p_output_tokens integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_text text := btrim(coalesce(p_hint_text, ''));
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if char_length(v_text) < 1 or char_length(v_text) > 4000 then
    raise exception 'invalid_hint_text';
  end if;

  if p_model is null or btrim(p_model) = '' then
    raise exception 'invalid_model';
  end if;

  update public.assignment_mentor_hints hints
  set
    status = 'ready',
    hint_text = v_text,
    model = btrim(p_model),
    input_tokens = p_input_tokens,
    output_tokens = p_output_tokens,
    updated_at = timezone('utc', now())
  where hints.id = p_hint_id
    and hints.user_id = v_user_id
    and hints.status in ('pending', 'failed');

  if not found then
    raise exception 'hint_not_found';
  end if;
end;
$$;

create or replace function private.fail_assignment_mentor_hint(p_hint_id uuid)
returns void
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

  update public.assignment_mentor_hints hints
  set
    status = 'failed',
    updated_at = timezone('utc', now())
  where hints.id = p_hint_id
    and hints.user_id = v_user_id
    and hints.status = 'pending';

  if not found then
    raise exception 'hint_not_found';
  end if;
end;
$$;

create function public.reserve_assignment_mentor_slot(
  p_assignment_id uuid,
  p_hint_level smallint,
  p_mode text,
  p_effort text
)
returns table(
  outcome text,
  hint_id uuid,
  hint_text text,
  request_count integer,
  remaining integer,
  daily_limit integer
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.reserve_assignment_mentor_slot($1, $2, $3, $4);
$$;

create function public.finalize_assignment_mentor_hint(
  p_hint_id uuid,
  p_hint_text text,
  p_model text,
  p_input_tokens integer,
  p_output_tokens integer
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.finalize_assignment_mentor_hint($1, $2, $3, $4, $5);
$$;

create function public.fail_assignment_mentor_hint(p_hint_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.fail_assignment_mentor_hint($1);
$$;

drop policy if exists "Learners save own assignment mentor hints"
  on public.assignment_mentor_hints;

revoke insert on table public.assignment_mentor_hints from authenticated;

revoke all on function private.reserve_assignment_mentor_slot(uuid, smallint, text, text) from public, anon;
revoke all on function private.finalize_assignment_mentor_hint(uuid, text, text, integer, integer) from public, anon;
revoke all on function private.fail_assignment_mentor_hint(uuid) from public, anon;
grant execute on function private.reserve_assignment_mentor_slot(uuid, smallint, text, text) to authenticated;
grant execute on function private.finalize_assignment_mentor_hint(uuid, text, text, integer, integer) to authenticated;
grant execute on function private.fail_assignment_mentor_hint(uuid) to authenticated;

revoke all on function public.reserve_assignment_mentor_slot(uuid, smallint, text, text) from public, anon;
revoke all on function public.finalize_assignment_mentor_hint(uuid, text, text, integer, integer) from public, anon;
revoke all on function public.fail_assignment_mentor_hint(uuid) from public, anon;
grant execute on function public.reserve_assignment_mentor_slot(uuid, smallint, text, text) to authenticated;
grant execute on function public.finalize_assignment_mentor_hint(uuid, text, text, integer, integer) to authenticated;
grant execute on function public.fail_assignment_mentor_hint(uuid) to authenticated;

comment on function private.reserve_assignment_mentor_slot(uuid, smallint, text, text) is
  'Atomically reserves the daily mentor quota and a pending hint slot. Ready and in-flight pending rows return without a second charge.';

comment on function private.fail_assignment_mentor_hint(uuid) is
  'Marks a pending hint as failed after provider or persistence errors. The daily quota charge is not refunded.';
