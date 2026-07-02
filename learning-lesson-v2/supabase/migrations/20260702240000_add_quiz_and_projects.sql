create table if not exists public.quiz_questions (
  id text primary key,
  topic text not null,
  question text not null,
  question_bg text not null,
  options jsonb not null default '[]'::jsonb,
  options_bg jsonb not null default '[]'::jsonb,
  correct_index integer not null default 0,
  explanation text not null,
  explanation_bg text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quiz_questions_topic_idx on public.quiz_questions (topic);

create table if not exists public.lesson_quiz_topics (
  lesson_id text primary key references public.lessons(id) on delete cascade,
  topic text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_projects (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  after_lesson_id text not null references public.lessons(id) on delete cascade,
  type text not null,
  title text not null,
  title_bg text,
  description text not null,
  description_bg text,
  brief_label text not null,
  brief_label_bg text,
  brief_placeholder text not null,
  brief_placeholder_bg text,
  brief_min_length integer not null default 40,
  requires_repo boolean not null default false,
  requires_deploy boolean not null default false,
  required_for_certificate boolean not null default false,
  checklist jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_projects_course_id_sort_order_idx on public.course_projects (course_id, sort_order);

drop trigger if exists set_quiz_questions_updated_at on public.quiz_questions;
create trigger set_quiz_questions_updated_at
before update on public.quiz_questions
for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_quiz_topics_updated_at on public.lesson_quiz_topics;
create trigger set_lesson_quiz_topics_updated_at
before update on public.lesson_quiz_topics
for each row execute function public.set_updated_at();

drop trigger if exists set_course_projects_updated_at on public.course_projects;
create trigger set_course_projects_updated_at
before update on public.course_projects
for each row execute function public.set_updated_at();

alter table public.quiz_questions enable row level security;
alter table public.lesson_quiz_topics enable row level security;
alter table public.course_projects enable row level security;

drop policy if exists "Anyone can read quiz questions" on public.quiz_questions;
create policy "Anyone can read quiz questions"
on public.quiz_questions for select to anon, authenticated using (true);

drop policy if exists "Admins can manage quiz questions" on public.quiz_questions;
create policy "Admins can manage quiz questions"
on public.quiz_questions for all to authenticated
using (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
  )
);

drop policy if exists "Anyone can read lesson quiz topics" on public.lesson_quiz_topics;
create policy "Anyone can read lesson quiz topics"
on public.lesson_quiz_topics for select to anon, authenticated using (true);

drop policy if exists "Admins can manage lesson quiz topics" on public.lesson_quiz_topics;
create policy "Admins can manage lesson quiz topics"
on public.lesson_quiz_topics for all to authenticated
using (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
  )
);

drop policy if exists "Anyone can read course projects" on public.course_projects;
create policy "Anyone can read course projects"
on public.course_projects for select to anon, authenticated using (true);

drop policy if exists "Admins can manage course projects" on public.course_projects;
create policy "Admins can manage course projects"
on public.course_projects for all to authenticated
using (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
  )
);
