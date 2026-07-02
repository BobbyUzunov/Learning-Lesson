create table if not exists public.courses (
  id text primary key,
  title text not null,
  title_bg text,
  description text not null,
  description_bg text,
  difficulty text not null,
  difficulty_bg text,
  estimated_time text not null,
  estimated_time_bg text,
  reward_badge text not null,
  reward_badge_bg text,
  xp_reward integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  sort_order integer not null,
  title text not null,
  title_bg text,
  explanation text not null,
  explanation_bg text,
  code_example text not null default '',
  mission text not null,
  mission_bg text,
  solution text not null default '',
  hint1 text,
  hint1_bg text,
  hint2 text,
  hint2_bg text,
  hint3 text,
  hint3_bg text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create index if not exists lessons_course_id_sort_order_idx on public.lessons (course_id, sort_order);

create table if not exists public.lesson_metadata (
  lesson_id text primary key references public.lessons(id) on delete cascade,
  learning_objectives jsonb not null default '[]'::jsonb,
  learning_objectives_bg jsonb not null default '[]'::jsonb,
  prerequisites jsonb not null default '[]'::jsonb,
  prerequisites_bg jsonb not null default '[]'::jsonb,
  key_concepts jsonb not null default '[]'::jsonb,
  key_concepts_bg jsonb not null default '[]'::jsonb,
  reading_time_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_metadata_updated_at on public.lesson_metadata;
create trigger set_lesson_metadata_updated_at
before update on public.lesson_metadata
for each row execute function public.set_updated_at();

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_metadata enable row level security;

drop policy if exists "Anyone can read courses" on public.courses;
create policy "Anyone can read courses"
on public.courses for select to anon, authenticated using (true);

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
on public.courses for all to authenticated
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

drop policy if exists "Anyone can read lessons" on public.lessons;
create policy "Anyone can read lessons"
on public.lessons for select to anon, authenticated using (true);

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons"
on public.lessons for all to authenticated
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

drop policy if exists "Anyone can read lesson metadata" on public.lesson_metadata;
create policy "Anyone can read lesson metadata"
on public.lesson_metadata for select to anon, authenticated using (true);

drop policy if exists "Admins can manage lesson metadata" on public.lesson_metadata;
create policy "Admins can manage lesson metadata"
on public.lesson_metadata for all to authenticated
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
