-- Stop authenticated clients from calling the private grader (it still returns correct_index).
-- Keep display names safe on every profile write, not only at signup.

revoke all on function private.grade_knowledge_check(text, jsonb) from public, anon, authenticated;
grant execute on function private.grade_knowledge_check(text, jsonb) to service_role;

create or replace function public.profiles_sanitize_display_name()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.display_name := public.sanitize_profile_display_name(new.display_name);
  return new;
end;
$$;

drop trigger if exists profiles_sanitize_display_name on public.profiles;
create trigger profiles_sanitize_display_name
before insert or update of display_name on public.profiles
for each row execute function public.profiles_sanitize_display_name();
