-- Remove the global per-minute guest-claim cap. Per-IP limits are enforced in API routes.

create or replace function private.issue_guest_progress_claim(
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

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('guest_progress_claim_issuance', 0)
  );

  delete from private.guest_progress_claims claim
  where claim.expires_at <= now()
    or (
      claim.redeemed_at is not null
      and claim.redeemed_at <= now() - interval '1 hour'
    );

  select count(*)::integer
  into v_total_claim_count
  from private.guest_progress_claims claim;

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
