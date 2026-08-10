-- Replace client-asserted guest lesson ids with a one-time, server-verified
-- completion capability. Raw claim tokens are returned once and only their
-- SHA-256 hashes are persisted.

create table private.guest_progress_claims (
  token_hash bytea primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete cascade,
  constraint guest_progress_claims_expiry_check
    check (expires_at > issued_at),
  constraint guest_progress_claims_redemption_check
    check (
      (redeemed_at is null and redeemed_by is null)
      or (redeemed_at is not null and redeemed_by is not null)
    )
);

alter table private.guest_progress_claims enable row level security;

revoke all on private.guest_progress_claims
  from public, anon, authenticated, service_role;

create index guest_progress_claims_unredeemed_expiry_idx
  on private.guest_progress_claims (expires_at)
  where redeemed_at is null;

create index guest_progress_claims_redeemed_by_idx
  on private.guest_progress_claims (redeemed_by)
  where redeemed_by is not null;

create index guest_progress_claims_issued_at_idx
  on private.guest_progress_claims (issued_at);

create index guest_progress_claims_redeemed_at_idx
  on private.guest_progress_claims (redeemed_at)
  where redeemed_at is not null;

create function private.issue_guest_progress_claim(
  p_lesson_id text,
  p_answers jsonb
)
returns table(ok boolean, claim_token text, expires_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_first_lesson_id text;
  v_answered integer := 0;
  v_correct integer := 0;
  v_claim_token text;
  v_expires_at timestamptz := now() + interval '7 days';
  v_recent_claim_count integer := 0;
  v_total_claim_count integer := 0;
begin
  if p_lesson_id is null
    or char_length(trim(p_lesson_id)) < 1
    or char_length(p_lesson_id) > 100 then
    raise exception 'invalid_guest_progress';
  end if;

  select lesson.id
  into v_first_lesson_id
  from public.lessons lesson
  join public.courses course on course.id = lesson.course_id
  order by course.sort_order, course.id, lesson.sort_order, lesson.id
  limit 1;

  if p_lesson_id is distinct from v_first_lesson_id then
    raise exception 'invalid_guest_progress';
  end if;

  select
    count(*)::integer,
    count(*) filter (where graded.is_correct)::integer
  into v_answered, v_correct
  from private.grade_knowledge_check(p_lesson_id, p_answers) graded;

  if v_answered < 1 or v_correct * 3 < v_answered * 2 then
    raise exception 'quiz_not_passed';
  end if;

  -- Serialize cleanup, admission checks, and insertion so concurrent route
  -- floods cannot race past either bound. Redeemed rows stay briefly so a
  -- successful redemption remains idempotent across immediate retries.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('guest_progress_claim_issuance', 0)
  );

  delete from private.guest_progress_claims claim
  where claim.expires_at <= now()
    or (
      claim.redeemed_at is not null
      and claim.redeemed_at <= now() - interval '1 hour'
    );

  select
    count(*) filter (where claim.issued_at >= now() - interval '1 minute')::integer,
    count(*)::integer
  into v_recent_claim_count, v_total_claim_count
  from private.guest_progress_claims claim;

  if v_recent_claim_count >= 120 then
    raise exception 'guest_claim_rate_limited';
  end if;

  if v_total_claim_count >= 10000 then
    raise exception 'guest_claim_capacity_reached';
  end if;

  v_claim_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into private.guest_progress_claims (
    token_hash,
    lesson_id,
    expires_at
  ) values (
    extensions.digest(v_claim_token, 'sha256'),
    p_lesson_id,
    v_expires_at
  );

  return query select true, v_claim_token, v_expires_at;
end;
$$;

create function public.issue_guest_progress_claim(
  p_lesson_id text,
  p_answers jsonb
)
returns table(ok boolean, claim_token text, expires_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select * from private.issue_guest_progress_claim($1, $2);
$$;

revoke all on function private.issue_guest_progress_claim(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.issue_guest_progress_claim(text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.issue_guest_progress_claim(text, jsonb)
  to service_role;

create function private.redeem_guest_progress(p_claim_token text)
returns table(ok boolean, xp integer, level integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_lesson_id text;
  v_expires_at timestamptz;
  v_redeemed_by uuid;
  v_xp integer := 0;
  v_level integer := 1;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_claim_token is null or p_claim_token !~ '^[0-9a-f]{64}$' then
    raise exception 'guest_proof_invalid';
  end if;

  select claim.lesson_id, claim.expires_at, claim.redeemed_by
  into v_lesson_id, v_expires_at, v_redeemed_by
  from private.guest_progress_claims claim
  where claim.token_hash = extensions.digest(p_claim_token, 'sha256')
  for update;

  if not found then
    raise exception 'guest_proof_invalid';
  end if;

  if v_redeemed_by is not null and v_redeemed_by is distinct from v_user_id then
    raise exception 'guest_proof_invalid';
  end if;

  if v_redeemed_by is null and v_expires_at <= now() then
    raise exception 'guest_proof_expired';
  end if;

  -- All XP writers lock the same profile row immediately before mutating
  -- progress, so their aggregate recomputations cannot overwrite each other.
  insert into public.profiles (id, auth_user_id)
  values (v_user_id, v_user_id)
  on conflict (id) do nothing;

  perform 1
  from public.profiles profile
  where profile.id = v_user_id
  for update;

  if v_redeemed_by is null then
    update private.guest_progress_claims claim
    set redeemed_at = now(), redeemed_by = v_user_id
    where claim.token_hash = extensions.digest(p_claim_token, 'sha256');
  end if;

  insert into public.user_progress (
    user_id,
    lesson_id,
    completed,
    xp_earned,
    completed_at
  ) values (
    v_user_id,
    v_lesson_id,
    true,
    100,
    now()
  )
  on conflict (user_id, lesson_id) do update
  set
    completed = true,
    xp_earned = 100,
    completed_at = coalesce(public.user_progress.completed_at, excluded.completed_at);

  select coalesce(sum(progress.xp_earned) filter (where progress.completed), 0)::integer
  into v_xp
  from public.user_progress progress
  where progress.user_id = v_user_id;

  v_level := case
    when v_xp >= 1000 then 5
    when v_xp >= 500 then 4
    when v_xp >= 250 then 3
    when v_xp >= 100 then 2
    else 1
  end;

  update public.profiles profile
  set xp = v_xp, level = v_level
  where profile.id = v_user_id;

  return query select true, v_xp, v_level;
end;
$$;

create function public.redeem_guest_progress(p_claim_token text)
returns table(ok boolean, xp integer, level integer)
language sql
security definer
set search_path = ''
as $$
  select * from private.redeem_guest_progress($1);
$$;

revoke all on function private.redeem_guest_progress(text)
  from public, anon, authenticated, service_role;
revoke all on function public.redeem_guest_progress(text)
  from public, anon, authenticated, service_role;
grant execute on function public.redeem_guest_progress(text) to authenticated;

-- Serialize the existing authenticated completion path with guest redemption
-- before recomputing the denormalized profile XP total.
create or replace function private.complete_lesson(p_lesson_id text, p_answers jsonb)
returns table(ok boolean, xp integer, level integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_id text;
  v_sort_order integer;
  v_prerequisite_id text;
  v_answered integer := 0;
  v_correct integer := 0;
  v_xp integer := 0;
  v_level integer := 1;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select lesson.course_id, lesson.sort_order
  into v_course_id, v_sort_order
  from public.lessons lesson
  where lesson.id = p_lesson_id;

  if v_course_id is null then
    raise exception 'unknown_lesson';
  end if;

  select previous_lesson.id
  into v_prerequisite_id
  from public.lessons previous_lesson
  where previous_lesson.course_id = v_course_id
    and previous_lesson.sort_order < v_sort_order
  order by previous_lesson.sort_order desc, previous_lesson.id
  limit 1;

  if v_prerequisite_id is not null and not exists (
    select 1
    from public.user_progress progress
    where progress.user_id = v_user_id
      and progress.lesson_id = v_prerequisite_id
      and progress.completed
  ) then
    raise exception 'lesson_locked';
  end if;

  select
    count(*)::integer,
    count(*) filter (where graded.is_correct)::integer
  into v_answered, v_correct
  from private.grade_knowledge_check(p_lesson_id, p_answers) graded;

  if v_answered < 1 or v_correct * 3 < v_answered * 2 then
    raise exception 'quiz_not_passed';
  end if;

  insert into public.profiles (id, auth_user_id)
  values (v_user_id, v_user_id)
  on conflict (id) do nothing;

  perform 1
  from public.profiles profile
  where profile.id = v_user_id
  for update;

  insert into public.user_progress (
    user_id, lesson_id, completed, xp_earned, completed_at
  ) values (
    v_user_id, p_lesson_id, true, 100, now()
  )
  on conflict (user_id, lesson_id) do update
  set
    completed = true,
    xp_earned = 100,
    completed_at = coalesce(public.user_progress.completed_at, excluded.completed_at);

  select coalesce(sum(progress.xp_earned) filter (where progress.completed), 0)::integer
  into v_xp
  from public.user_progress progress
  where progress.user_id = v_user_id;

  v_level := case
    when v_xp >= 1000 then 5
    when v_xp >= 500 then 4
    when v_xp >= 250 then 3
    when v_xp >= 100 then 2
    else 1
  end;

  update public.profiles profile
  set xp = v_xp, level = v_level
  where profile.id = v_user_id;

  return query select true, v_xp, v_level;
end;
$$;

-- Keep the legacy RPC callable until the new application version is live.
-- The follow-up contract migration revokes and drops it immediately after the
-- production smoke test, avoiding an outage during the expand/deploy window.
