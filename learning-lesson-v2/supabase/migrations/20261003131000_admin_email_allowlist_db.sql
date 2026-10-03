-- Sync ADMIN_EMAIL_ALLOWLIST into Postgres so private.is_admin matches the app gate.
-- Empty private.admin_emails keeps role-only admin (local/dev). Non-empty requires membership.

create table if not exists private.admin_emails (
  email text primary key,
  updated_at timestamptz not null default now(),
  constraint admin_emails_email_check check (char_length(btrim(email)) > 2)
);

revoke all on table private.admin_emails from public, anon, authenticated;
grant all on table private.admin_emails to service_role;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
      and (
        not exists (select 1 from private.admin_emails)
        or exists (
          select 1
          from private.admin_emails allowlist
          where lower(allowlist.email) = lower(coalesce(profile.email, ''))
        )
      )
  );
$$;

create or replace function private.replace_admin_emails(p_emails text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer := 0;
  v_email text;
  v_normalized text[];
begin
  v_normalized := array(
    select distinct lower(btrim(entry))
    from unnest(coalesce(p_emails, '{}'::text[])) as entry
    where char_length(btrim(entry)) > 2
  );

  delete from private.admin_emails;

  foreach v_email in array v_normalized
  loop
    insert into private.admin_emails (email) values (v_email);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.replace_admin_emails(p_emails text[])
returns integer
language sql
security definer
set search_path = ''
as $$
  select private.replace_admin_emails($1);
$$;

revoke all on function private.replace_admin_emails(text[]) from public, anon, authenticated;
grant execute on function private.replace_admin_emails(text[]) to service_role;

revoke all on function public.replace_admin_emails(text[]) from public, anon, authenticated;
grant execute on function public.replace_admin_emails(text[]) to service_role;
