-- Orphaned profiles can linger when Auth already deleted/soft-deleted the user
-- without cascading public.profiles. Allow service_role cleanup from admin APIs.

grant delete on table public.profiles to service_role;

create or replace function private.purge_orphaned_profile(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1
    from auth.users auth_user
    where auth_user.id = p_user_id
      and auth_user.deleted_at is null
  ) then
    raise exception 'auth_user_still_exists';
  end if;

  -- Soft-deleted Auth rows still block a clean Roles list; remove them so FKs cascade.
  delete from auth.users where id = p_user_id;

  delete from public.profiles where id = p_user_id;
end;
$$;

revoke all on function private.purge_orphaned_profile(uuid) from public, anon, authenticated;
grant execute on function private.purge_orphaned_profile(uuid) to service_role;

create or replace function public.purge_orphaned_profile(p_user_id uuid)
returns void
language sql
security definer
set search_path = public, private, pg_temp
as $$
  select private.purge_orphaned_profile(p_user_id);
$$;

revoke all on function public.purge_orphaned_profile(uuid) from public, anon, authenticated;
grant execute on function public.purge_orphaned_profile(uuid) to service_role;
