-- A narrow bridge from an official curriculum mission to a relevant, playable
-- technology-lab lesson. Course identity is derived from lessons.course_id so
-- links cannot point at a course and an unrelated lesson at the same time.

create table if not exists public.curriculum_mission_labs (
  mission_id text not null references public.curriculum_missions(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  primary key (mission_id, lesson_id),
  unique (mission_id, sort_order),
  constraint curriculum_mission_labs_sort_order_check check (sort_order >= 0)
);

-- The primary key covers mission_id. The reverse index is required for the
-- lesson foreign key, course joins, and efficient lesson deletion.
create index if not exists curriculum_mission_labs_lesson_id_idx
  on public.curriculum_mission_labs (lesson_id);

alter table public.curriculum_mission_labs enable row level security;

drop policy if exists "Anyone can read curriculum mission labs" on public.curriculum_mission_labs;
create policy "Anyone can read curriculum mission labs"
on public.curriculum_mission_labs for select to anon, authenticated
using (true);

drop policy if exists "Admins can manage curriculum mission labs" on public.curriculum_mission_labs;
create policy "Admins can manage curriculum mission labs"
on public.curriculum_mission_labs for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on table public.curriculum_mission_labs from public, anon, authenticated;
grant select on table public.curriculum_mission_labs to anon, authenticated;
grant insert, update, delete on table public.curriculum_mission_labs to authenticated;

-- Content can be absent on a fresh migration-only install and imported later
-- through the guarded admin seed. Populate the bridge immediately when both
-- canonical rows already exist in an established environment.
insert into public.curriculum_mission_labs (mission_id, lesson_id, sort_order)
select 'mission-first-class-page', '1', 0
where exists (
  select 1 from public.curriculum_missions where id = 'mission-first-class-page'
)
and exists (
  select 1 from public.lessons where id = '1'
)
on conflict (mission_id, lesson_id) do update
set sort_order = excluded.sort_order;

comment on table public.curriculum_mission_labs is
  'Curated mission-to-lesson recommendations; lesson completion remains the only source of XP and course certificates.';
