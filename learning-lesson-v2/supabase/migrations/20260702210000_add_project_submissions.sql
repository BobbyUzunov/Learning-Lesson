create table if not exists public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  repo_url text,
  deploy_url text,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_id)
);

drop trigger if exists set_project_submissions_updated_at on public.project_submissions;
create trigger set_project_submissions_updated_at
before update on public.project_submissions
for each row execute function public.set_updated_at();

alter table public.project_submissions enable row level security;

drop policy if exists "Users can read own project submissions" on public.project_submissions;
create policy "Users can read own project submissions"
on public.project_submissions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own project submissions" on public.project_submissions;
create policy "Users can insert own project submissions"
on public.project_submissions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own project submissions" on public.project_submissions;
create policy "Users can update own project submissions"
on public.project_submissions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can read all project submissions" on public.project_submissions;
create policy "Admins can read all project submissions"
on public.project_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);
