-- Repair registration trigger permissions and security mode.
-- Run this in Supabase SQL Editor if signup still returns
-- "Database error saving new user".
--
-- Important: CREATE OR REPLACE does not change SECURITY INVOKER -> DEFINER.
-- This migration drops and recreates the trigger function with the correct mode.

create extension if not exists "pgcrypto";

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

update public.profiles set role = coalesce(role, 'user') where role is null;
update public.profiles set xp = coalesce(xp, 0) where xp is null;
update public.profiles set level = coalesce(level, 1) where level is null;
update public.profiles set streak_count = coalesce(streak_count, 0) where streak_count is null;
update public.profiles set created_at = coalesce(created_at, now()) where created_at is null;
update public.profiles set updated_at = coalesce(updated_at, now()) where updated_at is null;
update public.profiles set auth_user_id = id where auth_user_id is null;

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

grant usage on schema public to postgres, supabase_auth_admin, service_role, authenticated, anon;
grant select, insert, update on table public.profiles to postgres, service_role;
grant select, insert, update on table public.profiles to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists after_user_signup on auth.users;
drop trigger if exists handle_new_user on auth.users;
drop trigger if exists on_new_user_created on auth.users;
drop trigger if exists create_profile_on_signup on auth.users;

drop function if exists public.handle_new_user() cascade;

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
for each row
execute function public.handle_new_user();

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

do $$
declare
  is_security_definer boolean;
  missing_columns text[];
begin
  select prosecdef
  into is_security_definer
  from pg_proc
  join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
  where pg_namespace.nspname = 'public'
    and pg_proc.proname = 'handle_new_user'
  limit 1;

  if coalesce(is_security_definer, false) is distinct from true then
    raise exception 'handle_new_user is not SECURITY DEFINER. Re-run this migration.';
  end if;

  select array_agg(required_column)
  into missing_columns
  from (
    values
      ('email'),
      ('role'),
      ('xp'),
      ('level'),
      ('auth_user_id'),
      ('display_name')
  ) as required(required_column)
  where not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = required_column
  );

  if coalesce(array_length(missing_columns, 1), 0) > 0 then
    raise exception 'profiles table is missing columns: %', array_to_string(missing_columns, ', ');
  end if;
end;
$$;
