-- Allow student/teacher role selection at signup (never admin).
-- Role comes from auth.users.raw_user_meta_data.intended_role.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := lower(nullif(btrim(coalesce(new.raw_user_meta_data->>'intended_role', '')), ''));
begin
  if v_role is null or v_role not in ('user', 'teacher') then
    v_role := 'user';
  end if;

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
    v_role
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

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and role in ('user', 'teacher')
);
