-- Fix registration: align public.profiles with handle_new_user() trigger.
-- Safe to run multiple times in Supabase SQL Editor or via supabase db push.

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

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists xp integer;
alter table public.profiles add column if not exists level integer;
alter table public.profiles add column if not exists created_at timestamptz;
alter table public.profiles add column if not exists updated_at timestamptz;
alter table public.profiles add column if not exists auth_user_id uuid;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists streak_count integer;
alter table public.profiles add column if not exists last_visit date;

update public.profiles
set role = coalesce(role, 'user')
where role is null;

update public.profiles
set xp = coalesce(xp, 0)
where xp is null;

update public.profiles
set level = coalesce(level, 1)
where level is null;

update public.profiles
set streak_count = coalesce(streak_count, 0)
where streak_count is null;

update public.profiles
set created_at = coalesce(created_at, now())
where created_at is null;

update public.profiles
set updated_at = coalesce(updated_at, now())
where updated_at is null;

update public.profiles profile_row
set auth_user_id = profile_row.id
where profile_row.auth_user_id is null;

update public.profiles profile_row
set email = auth_user.email
from auth.users auth_user
where profile_row.id = auth_user.id
  and profile_row.email is null
  and auth_user.email is not null;

alter table public.profiles alter column role set default 'user';
alter table public.profiles alter column xp set default 0;
alter table public.profiles alter column level set default 1;
alter table public.profiles alter column streak_count set default 0;
alter table public.profiles alter column created_at set default now();
alter table public.profiles alter column updated_at set default now();

alter table public.profiles alter column role set not null;
alter table public.profiles alter column xp set not null;
alter table public.profiles alter column level set not null;
alter table public.profiles alter column streak_count set not null;
alter table public.profiles alter column created_at set not null;
alter table public.profiles alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_id_fkey
    foreign key (id) references auth.users(id) on delete cascade;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_auth_user_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_auth_user_id_fkey
    foreign key (auth_user_id) references auth.users(id) on delete cascade;
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

create or replace function public.derive_profile_display_name(
  metadata jsonb,
  user_email text
)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(trim(metadata->>'display_name'), ''),
    nullif(trim(metadata->>'full_name'), ''),
    nullif(trim(metadata->>'name'), ''),
    nullif(split_part(coalesce(user_email, ''), '@', 1), '')
  );
$$;

create or replace function public.handle_new_user()
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
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

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

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

alter table public.profiles enable row level security;

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

-- Post-migration verification (raises if schema/trigger are inconsistent).
do $$
declare
  missing_columns text[];
begin
  select array_agg(required_column)
  into missing_columns
  from (
    values
      ('email'),
      ('role'),
      ('xp'),
      ('level'),
      ('auth_user_id'),
      ('display_name'),
      ('streak_count'),
      ('last_visit'),
      ('created_at'),
      ('updated_at')
  ) as required(required_column)
  where not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = required_column
  );

  if coalesce(array_length(missing_columns, 1), 0) > 0 then
    raise exception 'profiles migration incomplete. Missing columns: %', array_to_string(missing_columns, ', ');
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    raise exception 'profiles migration incomplete. on_auth_user_created trigger is missing.';
  end if;
end;
$$;
