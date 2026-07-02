create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user',
  xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists email text;

alter table public.profiles
add column if not exists role text not null default 'user';

alter table public.profiles
add column if not exists xp integer not null default 0;

alter table public.profiles
add column if not exists level integer not null default 1;

alter table public.profiles
add column if not exists created_at timestamptz not null default now();

alter table public.profiles
add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

alter table public.profiles
add column if not exists display_name text;

update public.profiles
set auth_user_id = id
where auth_user_id is null;

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  xp_earned integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_progress
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.user_progress
alter column user_id set not null;

alter table public.user_progress
add column if not exists lesson_id text;

alter table public.user_progress
alter column lesson_id set not null;

alter table public.user_progress
add column if not exists xp_earned integer not null default 0;

alter table public.user_progress
add column if not exists created_at timestamptz not null default now();

alter table public.user_progress
add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_progress_user_id_lesson_id_key'
  ) then
    alter table public.user_progress
    add constraint user_progress_user_id_lesson_id_key unique (user_id, lesson_id);
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if old.role is distinct from new.role and auth.uid() = new.id then
    raise exception 'Users cannot change their own profile role.';
  end if;

  return new;
end;
$$;

create or replace function public.derive_profile_display_name(
  metadata jsonb,
  user_email text
)
returns text
language sql
immutable
security invoker
set search_path = public
as $$
  select coalesce(
    nullif(trim(metadata->>'display_name'), ''),
    nullif(trim(metadata->>'full_name'), ''),
    nullif(trim(metadata->>'name'), ''),
    nullif(split_part(coalesce(user_email, ''), '@', 1), '')
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    auth_user_id,
    email,
    display_name
  )
  values (
    new.id,
    new.id,
    new.email,
    public.derive_profile_display_name(new.raw_user_meta_data, new.email)
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    auth_user_id = coalesce(public.profiles.auth_user_id, excluded.auth_user_id),
    display_name = coalesce(excluded.display_name, public.profiles.display_name);

  return new;
exception
  when others then
    raise exception 'handle_new_user failed for %: %', new.id, sqlerrm;
end;
$$;

alter function public.handle_new_user() owner to postgres;
alter function public.handle_new_user() security definer;
grant execute on function public.handle_new_user() to postgres, supabase_auth_admin, service_role;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id and role = 'user');

drop policy if exists "Users can update own profile basics" on public.profiles;
create policy "Users can update own profile basics"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own progress" on public.user_progress;
create policy "Users can read own progress"
on public.user_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
on public.user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_progress;
create policy "Users can update own progress"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can read all progress" on public.user_progress;
create policy "Admins can read all progress"
on public.user_progress
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

alter table public.profiles
add column if not exists streak_count integer not null default 0;

alter table public.profiles
add column if not exists last_visit date;

create table if not exists public.game_missions (
  id text primary key,
  quest_id text not null,
  title text,
  title_bg text,
  explanation text,
  explanation_bg text,
  code_example text,
  mission text,
  mission_bg text,
  solution text,
  hint1 text,
  hint1_bg text,
  hint2 text,
  hint2_bg text,
  hint3 text,
  hint3_bg text,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_game_missions_updated_at on public.game_missions;
create trigger set_game_missions_updated_at
before update on public.game_missions
for each row execute function public.set_updated_at();

alter table public.game_missions enable row level security;

drop policy if exists "Anyone can read game missions" on public.game_missions;
create policy "Anyone can read game missions"
on public.game_missions
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage game missions" on public.game_missions;
create policy "Admins can manage game missions"
on public.game_missions
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

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

create table if not exists public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  repo_url text,
  deploy_url text,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_id)
);

drop trigger if exists set_project_submissions_updated_at on public.project_submissions;
create trigger set_project_submissions_updated_at
before update on public.project_submissions
for each row execute function public.set_updated_at();

alter table public.project_submissions enable row level security;

drop policy if exists "Users can read own project submissions" on public.project_submissions;
create policy "Users can read own project submissions"
on public.project_submissions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own project submissions" on public.project_submissions;
create policy "Users can insert own project submissions"
on public.project_submissions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own project submissions" on public.project_submissions;
create policy "Users can update own project submissions"
on public.project_submissions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can read all project submissions" on public.project_submissions;
create policy "Admins can read all project submissions"
on public.project_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);
