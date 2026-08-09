-- Guests call grade_knowledge_check with the anon key. The public wrapper must be
-- SECURITY DEFINER so it can invoke private.grade_knowledge_check without
-- granting USAGE on the private schema to anon.

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
security definer
set search_path = ''
as $$
  select * from private.grade_knowledge_check($1, $2);
$$;

revoke all on function public.grade_knowledge_check(text, jsonb) from public;
grant execute on function public.grade_knowledge_check(text, jsonb) to anon, authenticated;

-- Anon no longer needs direct execute on the private implementation.
revoke all on function private.grade_knowledge_check(text, jsonb) from anon;
grant execute on function private.grade_knowledge_check(text, jsonb) to authenticated;
