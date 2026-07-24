-- School curriculum layer for vocational programs, starting with the grade 8
-- pilot based on the official 2026/2027 plans published by PGKNMA.

create table if not exists public.specialties (
  id text primary key,
  profession_code text not null unique,
  title text not null,
  title_bg text not null,
  description text not null,
  description_bg text not null,
  accent text not null default 'violet',
  icon text not null default 'code',
  source_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint specialties_accent_check check (accent in ('violet', 'mint', 'coral', 'ink')),
  constraint specialties_icon_check check (icon in ('code', 'brain', 'palette', 'shield')),
  constraint specialties_profession_code_check check (profession_code ~ '^[0-9]{6}$')
);

create table if not exists public.curriculum_modules (
  id text primary key,
  specialty_id text references public.specialties(id) on delete cascade,
  grade_level smallint not null,
  module_type text not null,
  status text not null default 'planned',
  title text not null,
  title_bg text not null,
  description text not null,
  description_bg text not null,
  learning_outcomes jsonb not null default '[]'::jsonb,
  learning_outcomes_bg jsonb not null default '[]'::jsonb,
  theory_hours smallint,
  practice_hours smallint,
  source_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_modules_grade_check check (grade_level between 8 and 12),
  constraint curriculum_modules_type_check check (module_type in ('foundation', 'sectoral', 'specialized')),
  constraint curriculum_modules_status_check check (status in ('pilot', 'planned')),
  constraint curriculum_modules_theory_hours_check check (theory_hours is null or theory_hours between 0 and 500),
  constraint curriculum_modules_practice_hours_check check (practice_hours is null or practice_hours between 0 and 500),
  constraint curriculum_modules_learning_outcomes_check check (
    jsonb_typeof(learning_outcomes) = 'array' and jsonb_typeof(learning_outcomes_bg) = 'array'
  )
);

create table if not exists public.curriculum_missions (
  id text primary key,
  module_id text not null references public.curriculum_modules(id) on delete cascade,
  title text not null,
  title_bg text not null,
  brief text not null,
  brief_bg text not null,
  deliverable text not null,
  deliverable_bg text not null,
  skills jsonb not null default '[]'::jsonb,
  skills_bg jsonb not null default '[]'::jsonb,
  estimated_minutes smallint not null default 45,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_missions_minutes_check check (estimated_minutes between 10 and 600),
  constraint curriculum_missions_skills_check check (
    jsonb_typeof(skills) = 'array' and jsonb_typeof(skills_bg) = 'array'
  )
);

create table if not exists public.curriculum_course_links (
  module_id text not null references public.curriculum_modules(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (module_id, course_id)
);

create index if not exists curriculum_modules_specialty_grade_order_idx
  on public.curriculum_modules (specialty_id, grade_level, sort_order);
create index if not exists curriculum_missions_module_id_idx
  on public.curriculum_missions (module_id);
create index if not exists curriculum_course_links_course_id_idx
  on public.curriculum_course_links (course_id);

drop trigger if exists set_specialties_updated_at on public.specialties;
create trigger set_specialties_updated_at
before update on public.specialties
for each row execute function public.set_updated_at();

drop trigger if exists set_curriculum_modules_updated_at on public.curriculum_modules;
create trigger set_curriculum_modules_updated_at
before update on public.curriculum_modules
for each row execute function public.set_updated_at();

drop trigger if exists set_curriculum_missions_updated_at on public.curriculum_missions;
create trigger set_curriculum_missions_updated_at
before update on public.curriculum_missions
for each row execute function public.set_updated_at();

alter table public.specialties enable row level security;
alter table public.curriculum_modules enable row level security;
alter table public.curriculum_missions enable row level security;
alter table public.curriculum_course_links enable row level security;

drop policy if exists "Anyone can read specialties" on public.specialties;
create policy "Anyone can read specialties"
on public.specialties for select to anon, authenticated using (true);

drop policy if exists "Admins can manage specialties" on public.specialties;
create policy "Admins can manage specialties"
on public.specialties for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Anyone can read curriculum modules" on public.curriculum_modules;
create policy "Anyone can read curriculum modules"
on public.curriculum_modules for select to anon, authenticated using (true);

drop policy if exists "Admins can manage curriculum modules" on public.curriculum_modules;
create policy "Admins can manage curriculum modules"
on public.curriculum_modules for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Anyone can read curriculum missions" on public.curriculum_missions;
create policy "Anyone can read curriculum missions"
on public.curriculum_missions for select to anon, authenticated using (true);

drop policy if exists "Admins can manage curriculum missions" on public.curriculum_missions;
create policy "Admins can manage curriculum missions"
on public.curriculum_missions for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Anyone can read curriculum course links" on public.curriculum_course_links;
create policy "Anyone can read curriculum course links"
on public.curriculum_course_links for select to anon, authenticated using (true);

drop policy if exists "Admins can manage curriculum course links" on public.curriculum_course_links;
create policy "Admins can manage curriculum course links"
on public.curriculum_course_links for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on table public.specialties from public;
revoke all on table public.curriculum_modules from public;
revoke all on table public.curriculum_missions from public;
revoke all on table public.curriculum_course_links from public;

grant select on table public.specialties to anon, authenticated;
grant select on table public.curriculum_modules to anon, authenticated;
grant select on table public.curriculum_missions to anon, authenticated;
grant select on table public.curriculum_course_links to anon, authenticated;

grant insert, update, delete on table public.specialties to authenticated;
grant insert, update, delete on table public.curriculum_modules to authenticated;
grant insert, update, delete on table public.curriculum_missions to authenticated;
grant insert, update, delete on table public.curriculum_course_links to authenticated;
