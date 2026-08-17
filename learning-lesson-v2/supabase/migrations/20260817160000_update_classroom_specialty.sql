-- Allow the class owner or an admin to set the classroom specialty.
-- Assignment mission lists follow this specialty so parallels are not mixed.

create or replace function private.update_classroom_specialty(
  p_classroom_id uuid,
  p_specialty_id text
)
returns table(id uuid, specialty_id text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if p_specialty_id is null or btrim(p_specialty_id) = '' then
    raise exception 'invalid_specialty';
  end if;

  if not exists (
    select 1 from public.specialties specialty where specialty.id = p_specialty_id
  ) then
    raise exception 'unknown_specialty';
  end if;

  if not exists (
    select 1 from public.classrooms classroom where classroom.id = p_classroom_id
  ) then
    raise exception 'classroom_not_found';
  end if;

  if not (
    (select private.is_classroom_owner(p_classroom_id))
    or (select private.is_admin())
  ) then
    raise exception 'not_authorized';
  end if;

  update public.classrooms classroom
  set specialty_id = p_specialty_id
  where classroom.id = p_classroom_id;

  return query
  select classroom.id, classroom.specialty_id
  from public.classrooms classroom
  where classroom.id = p_classroom_id;
end;
$$;

create or replace function public.update_classroom_specialty(
  p_classroom_id uuid,
  p_specialty_id text
)
returns table(id uuid, specialty_id text)
language sql
security invoker
set search_path = ''
as $$
  select * from private.update_classroom_specialty($1, $2);
$$;

revoke all on function private.update_classroom_specialty(uuid, text) from public, anon;
revoke all on function public.update_classroom_specialty(uuid, text) from public, anon;
grant execute on function private.update_classroom_specialty(uuid, text) to authenticated;
grant execute on function public.update_classroom_specialty(uuid, text) to authenticated;

comment on function public.update_classroom_specialty(uuid, text) is
  'Sets the classroom specialty so assigned missions stay within one parallel.';
