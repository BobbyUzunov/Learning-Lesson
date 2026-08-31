-- Reject unsafe display names at the database layer and clean existing poisoned rows.

create or replace function public.sanitize_profile_display_name(raw_name text)
returns text
language sql
immutable
security invoker
set search_path = public
as $$
  select case
    when raw_name is null or btrim(raw_name) = '' then null
    when char_length(btrim(raw_name)) > 80 then null
    when btrim(raw_name) ~ '[<>&\\`{}]' then null
    when btrim(raw_name) ~* 'javascript:' then null
    when btrim(raw_name) ~ '[[:cntrl:]]' then null
    else btrim(raw_name)
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
  select public.sanitize_profile_display_name(
    coalesce(
      nullif(trim(metadata->>'display_name'), ''),
      nullif(trim(metadata->>'full_name'), ''),
      nullif(trim(metadata->>'name'), ''),
      nullif(split_part(coalesce(user_email, ''), '@', 1), '')
    )
  );
$$;

update public.profiles
set display_name = public.sanitize_profile_display_name(display_name)
where display_name is not null
  and public.sanitize_profile_display_name(display_name) is distinct from display_name;
