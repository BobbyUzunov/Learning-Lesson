-- Teacher role is no longer granted at signup.
-- Signup always creates role = user; admins promote teachers via set_user_role.
-- intended_role in auth metadata is kept for audit only.

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
    display_name,
    role
  )
  values (
    new.id,
    new.id,
    new.email,
    public.derive_profile_display_name(new.raw_user_meta_data, new.email),
    'user'
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

-- New self-inserts may only create student profiles; teacher/admin come from privileged RPCs.
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and role = 'user'
);
