-- Persist AI mentor directions per learner and assignment so refreshes and
-- other devices restore the same history. Learners can only access their own rows.
create table public.assignment_mentor_hints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.classroom_assignments(id) on delete cascade,
  hint_level smallint not null check (hint_level between 1 and 3),
  mode text not null check (mode in ('start', 'review', 'explain')),
  effort text,
  hint_text text not null check (char_length(btrim(hint_text)) between 1 and 4000),
  model text not null,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, assignment_id, hint_level),
  constraint assignment_mentor_hints_effort_check
    check (effort is null or char_length(effort) <= 1600)
);

create index assignment_mentor_hints_user_assignment_idx
  on public.assignment_mentor_hints (user_id, assignment_id, hint_level);

alter table public.assignment_mentor_hints enable row level security;

create policy "Learners read own assignment mentor hints"
on public.assignment_mentor_hints for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners save own assignment mentor hints"
on public.assignment_mentor_hints for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.classroom_assignments assignment
    where assignment.id = assignment_id
      and (select private.is_classroom_member(assignment.classroom_id))
  )
);

revoke all on table public.assignment_mentor_hints from public, anon;
grant select, insert on table public.assignment_mentor_hints to authenticated;
grant all on table public.assignment_mentor_hints to service_role;
