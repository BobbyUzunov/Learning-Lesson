-- Grade 8 modules now carry a full year of missions, so the catalog needs a
-- stable teaching order inside each module.

alter table public.curriculum_missions
  add column if not exists sort_order integer not null default 0;

create index if not exists curriculum_missions_module_order_idx
  on public.curriculum_missions (module_id, sort_order);
