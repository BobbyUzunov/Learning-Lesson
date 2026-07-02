-- Supabase schema for Learning Environment
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.learning_paths (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    description text,
    icon text,
    difficulty text,
    estimated_time text,
    sort_order integer not null default 0,
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
    id uuid primary key default gen_random_uuid(),
    path_id uuid references public.learning_paths(id) on delete set null,
    path_slug text not null references public.learning_paths(slug) on update cascade,
    slug text not null,
    label text,
    title text not null,
    category text,
    description text,
    detailed_explanation text,
    code text,
    sort_order integer not null default 0,
    xp_reward integer not null default 25,
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(path_slug, slug)
);

create table if not exists public.profiles (
    id uuid primary key,
    auth_user_id uuid unique,
    display_name text,
    selected_path_slug text references public.learning_paths(slug) on update cascade,
    xp integer not null default 0,
    level integer not null default 1,
    streak_days integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null,
    path_slug text not null references public.learning_paths(slug) on update cascade,
    lesson_slug text not null,
    completed boolean not null default false,
    completed_at timestamptz,
    updated_at timestamptz not null default now(),
    unique(profile_id, path_slug, lesson_slug)
);

create index if not exists idx_lessons_path_sort on public.lessons(path_slug, sort_order);
create index if not exists idx_progress_profile on public.user_progress(profile_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_learning_paths_updated_at on public.learning_paths;
create trigger set_learning_paths_updated_at
before update on public.learning_paths
for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

alter table public.learning_paths enable row level security;
alter table public.lessons enable row level security;
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Public can read published paths" on public.learning_paths;
create policy "Public can read published paths"
on public.learning_paths for select
using (published = true);

drop policy if exists "Public can read published lessons" on public.lessons;
create policy "Public can read published lessons"
on public.lessons for select
using (published = true);

-- Temporary browser-admin policies.
-- For production, replace these with Supabase Auth admin-role policies
-- or move lesson writes behind a server route using SUPABASE_SERVICE_ROLE_KEY.
drop policy if exists "Temporary anon lesson insert" on public.lessons;
create policy "Temporary anon lesson insert"
on public.lessons for insert
to anon
with check (true);

drop policy if exists "Temporary anon lesson update" on public.lessons;
create policy "Temporary anon lesson update"
on public.lessons for update
to anon
using (true)
with check (true);

drop policy if exists "Temporary anon lesson delete" on public.lessons;
create policy "Temporary anon lesson delete"
on public.lessons for delete
to anon
using (true);

-- Temporary local-profile progress policies.
-- Until Supabase Auth is added, the browser stores a generated profile_id in localStorage.
drop policy if exists "Temporary anon progress read" on public.user_progress;
create policy "Temporary anon progress read"
on public.user_progress for select
to anon
using (true);

drop policy if exists "Temporary anon progress insert" on public.user_progress;
create policy "Temporary anon progress insert"
on public.user_progress for insert
to anon
with check (true);

drop policy if exists "Temporary anon progress update" on public.user_progress;
create policy "Temporary anon progress update"
on public.user_progress for update
to anon
using (true)
with check (true);

insert into public.learning_paths (slug, title, description, icon, difficulty, estimated_time, sort_order)
values
    ('javascript', 'JavaScript', 'Основи, DOM, async и проекти.', 'JS', 'Начинаещ', '6-8 часа', 1),
    ('python', 'Python', 'Основи на Python за начинаещи.', 'PY', 'Начинаещ', '5-7 часа', 2),
    ('swift', 'Swift', 'Swift синтаксис и app thinking.', 'SW', 'Средно', '5-7 часа', 3),
    ('backend', 'Backend', 'Node.js, Express, API и deploy.', 'API', 'Средно', '6-8 часа', 4),
    ('web', 'HTML/CSS', 'Frontend основи и responsive UI.', 'WEB', 'Начинаещ', '4-6 часа', 5),
    ('new', 'AI & Tools', 'AI workflows, TypeScript мислене и tooling.', 'AI', 'Леко', '2-3 часа', 6)
on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    icon = excluded.icon,
    difficulty = excluded.difficulty,
    estimated_time = excluded.estimated_time,
    sort_order = excluded.sort_order;

-- Optional starter lesson. Admin panel can add the rest.
insert into public.lessons (path_slug, slug, label, title, category, description, detailed_explanation, code, sort_order)
values (
    'new',
    'supabase-setup',
    '🗄️ Supabase setup',
    'Supabase setup',
    'Database',
    'Първи урок за свързване на реална база данни към learning платформата.',
    '<div class="lesson-section"><h3 class="lesson-section-title">Какво прави Supabase?</h3><p class="lesson-section-description">Supabase дава Postgres база, Auth, Storage и realtime API.</p></div>',
    'console.log("Supabase е готов за свързване.");',
    99
)
on conflict (path_slug, slug) do nothing;
