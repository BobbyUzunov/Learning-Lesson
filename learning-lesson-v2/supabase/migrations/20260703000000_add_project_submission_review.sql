alter table public.project_submissions
add column if not exists status text not null default 'draft';

alter table public.project_submissions
add column if not exists review_notes text;

alter table public.project_submissions
add column if not exists reviewed_at timestamptz;

alter table public.project_submissions
add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

update public.project_submissions
set status = 'submitted'
where submitted_at is not null
  and status = 'draft';

alter table public.project_submissions
drop constraint if exists project_submissions_status_check;

alter table public.project_submissions
add constraint project_submissions_status_check
check (status in ('draft', 'submitted', 'approved', 'needs_changes'));

drop policy if exists "Admins can update all project submissions" on public.project_submissions;
create policy "Admins can update all project submissions"
on public.project_submissions
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);
