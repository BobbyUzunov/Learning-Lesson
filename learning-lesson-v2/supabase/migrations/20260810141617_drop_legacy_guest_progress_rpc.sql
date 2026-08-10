revoke all on function public.merge_guest_progress(text[])
  from public, anon, authenticated, service_role;

revoke all on function private.merge_guest_progress(text[])
  from public, anon, authenticated, service_role;

drop function public.merge_guest_progress(text[]);
drop function private.merge_guest_progress(text[]);
