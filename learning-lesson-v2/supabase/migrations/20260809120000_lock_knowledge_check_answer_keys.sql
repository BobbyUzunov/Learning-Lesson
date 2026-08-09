-- Lock knowledge-check answer keys behind admin RLS + security-definer RPCs.
-- Learners receive question text/options only; grading returns feedback after submit.

drop policy if exists "Anyone can read quiz questions" on public.quiz_questions;

drop policy if exists "Admins can read quiz questions" on public.quiz_questions;
create policy "Admins can read quiz questions"
on public.quiz_questions
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create or replace function public.get_knowledge_check_questions()
returns table (
  id text,
  topic text,
  question text,
  question_bg text,
  options jsonb,
  options_bg jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    question.id,
    question.topic,
    question.question,
    question.question_bg,
    question.options,
    question.options_bg
  from public.quiz_questions question
  order by question.topic, question.id;
$$;

revoke all on function public.get_knowledge_check_questions() from public, anon, authenticated;
grant execute on function public.get_knowledge_check_questions() to anon, authenticated;

create or replace function private.grade_knowledge_check(p_lesson_id text, p_answers jsonb)
returns table (
  question_id text,
  selected_index integer,
  correct_index integer,
  is_correct boolean,
  explanation text,
  explanation_bg text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_topic text;
  v_topic_count integer := 0;
  v_html_count integer := 0;
  v_required integer := 0;
  v_answered integer := 0;
begin
  if p_lesson_id is null or length(trim(p_lesson_id)) < 1 then
    raise exception 'quiz_unavailable';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception 'quiz_not_passed';
  end if;

  select mapping.topic
  into v_topic
  from public.lesson_quiz_topics mapping
  where mapping.lesson_id = p_lesson_id;

  if v_topic is null then
    raise exception 'quiz_unavailable';
  end if;

  select count(*)::integer into v_topic_count
  from public.quiz_questions question
  where question.topic = v_topic;

  select count(*)::integer into v_html_count
  from public.quiz_questions question
  where question.topic = 'html';

  v_required := least(
    3,
    v_topic_count + case when v_topic <> 'html' and v_topic_count < 3 then v_html_count else 0 end
  );

  if v_required < 1 then
    raise exception 'quiz_unavailable';
  end if;

  with parsed_answers as (
    select distinct on (answer.value->>'questionId')
      answer.value->>'questionId' as question_id,
      (answer.value->>'selectedIndex')::integer as selected_index
    from jsonb_array_elements(p_answers) answer
    where jsonb_typeof(answer.value) = 'object'
      and coalesce(answer.value->>'questionId', '') <> ''
      and coalesce(answer.value->>'selectedIndex', '') ~ '^[0-9]+$'
    order by answer.value->>'questionId'
  ), valid_answers as (
    select parsed.question_id
    from parsed_answers parsed
    join public.quiz_questions question on question.id = parsed.question_id
    where question.topic = v_topic
      or (v_topic <> 'html' and v_topic_count < 3 and question.topic = 'html')
  )
  select count(*)::integer into v_answered
  from valid_answers;

  if v_answered <> v_required then
    raise exception 'quiz_not_passed';
  end if;

  return query
  with parsed_answers as (
    select distinct on (answer.value->>'questionId')
      answer.value->>'questionId' as question_id,
      (answer.value->>'selectedIndex')::integer as selected_index
    from jsonb_array_elements(p_answers) answer
    where jsonb_typeof(answer.value) = 'object'
      and coalesce(answer.value->>'questionId', '') <> ''
      and coalesce(answer.value->>'selectedIndex', '') ~ '^[0-9]+$'
    order by answer.value->>'questionId'
  ), valid_answers as (
    select
      parsed.question_id,
      parsed.selected_index,
      question.correct_index,
      question.explanation,
      question.explanation_bg
    from parsed_answers parsed
    join public.quiz_questions question on question.id = parsed.question_id
    where question.topic = v_topic
      or (v_topic <> 'html' and v_topic_count < 3 and question.topic = 'html')
  )
  select
    valid.question_id,
    valid.selected_index,
    valid.correct_index,
    (valid.selected_index = valid.correct_index) as is_correct,
    valid.explanation,
    valid.explanation_bg
  from valid_answers valid;
end;
$$;

create or replace function public.grade_knowledge_check(p_lesson_id text, p_answers jsonb)
returns table (
  question_id text,
  selected_index integer,
  correct_index integer,
  is_correct boolean,
  explanation text,
  explanation_bg text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.grade_knowledge_check($1, $2);
$$;

revoke all on function private.grade_knowledge_check(text, jsonb) from public, anon, authenticated;
grant execute on function private.grade_knowledge_check(text, jsonb) to anon, authenticated;

revoke all on function public.grade_knowledge_check(text, jsonb) from public;
grant execute on function public.grade_knowledge_check(text, jsonb) to anon, authenticated;
