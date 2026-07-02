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
to authenticated
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
