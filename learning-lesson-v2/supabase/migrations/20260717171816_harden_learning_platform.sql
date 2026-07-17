-- Canonical hardening migration for Learning Lesson v2.
-- It is intentionally idempotent so existing projects and fresh migration-only
-- installs converge on the same secure schema.

create extension if not exists "pgcrypto";

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  xp_earned integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- The connected project still carries v1 progress columns. Preserve any
-- legacy rows while allowing v2 records to use the managed identity columns.
alter table public.user_progress add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.user_progress add column if not exists lesson_id text;
alter table public.user_progress add column if not exists xp_earned integer not null default 0;
alter table public.user_progress add column if not exists completed_at timestamptz;
alter table public.user_progress add column if not exists created_at timestamptz not null default now();
alter table public.user_progress add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_progress' and column_name = 'profile_id'
  ) then
    execute $sql$
      update public.user_progress progress
      set user_id = progress.profile_id
      where progress.user_id is null
        and exists (select 1 from auth.users auth_user where auth_user.id = progress.profile_id)
    $sql$;
    execute 'alter table public.user_progress alter column profile_id drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_progress' and column_name = 'lesson_slug'
  ) then
    execute $sql$
      update public.user_progress progress
      set lesson_id = progress.lesson_slug
      where progress.lesson_id is null
        and exists (select 1 from public.lessons lesson where lesson.id = progress.lesson_slug)
    $sql$;
    execute 'alter table public.user_progress alter column lesson_slug drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_progress' and column_name = 'path_slug'
  ) then
    execute 'alter table public.user_progress alter column path_slug drop not null';
  end if;
end;
$$;

create table if not exists public.mentor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default ((timezone('utc', now()))::date),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, usage_date)
);

create table if not exists public.mentor_settings (
  singleton boolean primary key default true check (singleton),
  daily_limit integer not null default 5 check (daily_limit between 1 and 20),
  updated_at timestamptz not null default now()
);

insert into public.mentor_settings (singleton, daily_limit)
values (true, 5)
on conflict (singleton) do nothing;

-- The production catalog predates the reviewed capstone. Add it without
-- overwriting any administrator customization if it has already been seeded.
insert into public.course_projects (
  id,
  course_id,
  after_lesson_id,
  type,
  title,
  title_bg,
  description,
  description_bg,
  brief_label,
  brief_label_bg,
  brief_placeholder,
  brief_placeholder_bg,
  brief_min_length,
  requires_repo,
  requires_deploy,
  required_for_certificate,
  checklist,
  sort_order
) values (
  'aipb-capstone',
  'ai-product-builder',
  '63',
  'capstone',
  'Capstone: Ship the Learning Platform',
  'Capstone: Ship-ни learning platform-а',
  'Submit your full learning platform: auth, progress, DB-backed catalog, projects, admin CMS, and a live Vercel deploy ready for learners.',
  'Submit-ни пълната learning platform: auth, progress, DB catalog, projects, admin CMS и live Vercel deploy, готов за learners.',
  'Capstone summary',
  'Capstone обобщение',
  'What you built, who it serves, core flows shipped, Supabase tables used, and what you would improve next...',
  'Какво изгради, за кого е, core flows, Supabase tables и какво би подобрил след deploy...',
  120,
  true,
  true,
  true,
  '[
    {"id":"auth","label":"Register/login and protected routes work","labelBg":"Register/login и protected routes работят"},
    {"id":"progress","label":"Lesson progress saves and unlock rules work","labelBg":"Lesson progress и unlock rules работят"},
    {"id":"catalog","label":"Courses and lessons load from Supabase","labelBg":"Courses и lessons идват от Supabase"},
    {"id":"projects","label":"Mini projects and submissions are wired","labelBg":"Mini projects и submissions са свързани"},
    {"id":"admin","label":"Admin CMS can edit content in DB","labelBg":"Admin CMS edit-ва content в DB"},
    {"id":"deploy","label":"Production deploy is live on Vercel","labelBg":"Production deploy е live във Vercel"}
  ]'::jsonb,
  2
)
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_mentor_settings_updated_at on public.mentor_settings;
create trigger set_mentor_settings_updated_at
before update on public.mentor_settings
for each row execute function public.set_updated_at();

-- Repair historical client-controlled totals before enforcing constraints.
update public.user_progress progress_row
set
  xp_earned = case
    when progress_row.completed and exists (
      select 1 from public.lessons lesson_row where lesson_row.id = progress_row.lesson_id
    ) then 100
    else 0
  end,
  completed_at = case
    when progress_row.completed then coalesce(progress_row.completed_at, progress_row.updated_at, now())
    else null
  end;

update public.profiles profile_row
set
  xp = totals.xp,
  level = case
    when totals.xp >= 1000 then 5
    when totals.xp >= 500 then 4
    when totals.xp >= 250 then 3
    when totals.xp >= 100 then 2
    else 1
  end,
  streak_count = greatest(coalesce(profile_row.streak_count, 0), 0)
from (
  select
    profile.id as user_id,
    coalesce(sum(progress.xp_earned) filter (where progress.completed), 0)::integer as xp
  from public.profiles profile
  left join public.user_progress progress on progress.user_id = profile.id
  group by profile.id
) totals
where profile_row.id = totals.user_id;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_progress_user_id_lesson_id_key'
      and conrelid = 'public.user_progress'::regclass
  ) then
    alter table public.user_progress
      add constraint user_progress_user_id_lesson_id_key unique (user_id, lesson_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'user_progress_lesson_id_fkey'
      and conrelid = 'public.user_progress'::regclass
  ) then
    alter table public.user_progress
      add constraint user_progress_lesson_id_fkey
      foreign key (lesson_id) references public.lessons(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'project_submissions_project_id_fkey'
      and conrelid = 'public.project_submissions'::regclass
  ) then
    alter table public.project_submissions
      add constraint project_submissions_project_id_fkey
      foreign key (project_id) references public.course_projects(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'admin')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_progress_values_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_progress_values_check
      check (xp >= 0 and level >= 1 and streak_count >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'user_progress_xp_check'
      and conrelid = 'public.user_progress'::regclass
  ) then
    alter table public.user_progress
      add constraint user_progress_xp_check check (xp_earned in (0, 100)) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'course_projects_type_check'
      and conrelid = 'public.course_projects'::regclass
  ) then
    alter table public.course_projects
      add constraint course_projects_type_check check (type in ('mini', 'capstone')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'course_projects_brief_min_length_check'
      and conrelid = 'public.course_projects'::regclass
  ) then
    alter table public.course_projects
      add constraint course_projects_brief_min_length_check
      check (brief_min_length between 1 and 10000) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'project_submissions_content_length_check'
      and conrelid = 'public.project_submissions'::regclass
  ) then
    alter table public.project_submissions
      add constraint project_submissions_content_length_check
      check (
        char_length(coalesce(notes, '')) <= 10000
        and char_length(coalesce(repo_url, '')) <= 2048
        and char_length(coalesce(deploy_url, '')) <= 2048
        and char_length(coalesce(review_notes, '')) <= 10000
      ) not valid;
  end if;
end;
$$;

create index if not exists profiles_auth_user_id_idx on public.profiles (auth_user_id);
create index if not exists user_progress_lesson_id_idx on public.user_progress (lesson_id);
create index if not exists course_projects_after_lesson_id_idx on public.course_projects (after_lesson_id);
create index if not exists project_submissions_project_id_idx on public.project_submissions (project_id);
create index if not exists project_submissions_reviewed_by_idx on public.project_submissions (reviewed_by);
create index if not exists project_submissions_pending_review_idx
  on public.project_submissions (submitted_at)
  where status = 'submitted';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'selected_path_slug'
  ) then
    execute 'create index if not exists profiles_selected_path_slug_idx on public.profiles (selected_path_slug)';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_progress' and column_name = 'path_slug'
  ) then
    execute 'create index if not exists user_progress_path_slug_idx on public.user_progress (path_slug)';
  end if;
end;
$$;

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
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

-- All exposed tables use RLS. Writes to managed learner state happen only
-- through the narrow functions defined later in this migration.
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_metadata enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.lesson_quiz_topics enable row level security;
alter table public.course_projects enable row level security;
alter table public.project_submissions enable row level security;
alter table public.mentor_daily_usage enable row level security;
alter table public.mentor_settings enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile basics" on public.profiles;
drop policy if exists "Users can update own display name" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;

create policy "Users can read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_admin()));

create policy "Users can insert own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id and role = 'user' and xp = 0 and level = 1);

create policy "Users can update own display name"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id and role = 'user');

drop policy if exists "Users can read own progress" on public.user_progress;
drop policy if exists "Users can insert own progress" on public.user_progress;
drop policy if exists "Users can update own progress" on public.user_progress;
drop policy if exists "Admins can read all progress" on public.user_progress;
drop policy if exists "Temporary anon progress insert" on public.user_progress;
drop policy if exists "Temporary anon progress update" on public.user_progress;

create policy "Users can read own progress"
on public.user_progress for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));

drop policy if exists "Anyone can read courses" on public.courses;
drop policy if exists "Admins can manage courses" on public.courses;
create policy "Anyone can read courses"
on public.courses for select to anon, authenticated using (true);

drop policy if exists "Anyone can read lessons" on public.lessons;
drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Anyone can read lessons"
on public.lessons for select to anon, authenticated using (true);

drop policy if exists "Anyone can read lesson metadata" on public.lesson_metadata;
drop policy if exists "Admins can manage lesson metadata" on public.lesson_metadata;
create policy "Anyone can read lesson metadata"
on public.lesson_metadata for select to anon, authenticated using (true);

drop policy if exists "Anyone can read quiz questions" on public.quiz_questions;
drop policy if exists "Admins can manage quiz questions" on public.quiz_questions;
create policy "Anyone can read quiz questions"
on public.quiz_questions for select to anon, authenticated using (true);

drop policy if exists "Anyone can read lesson quiz topics" on public.lesson_quiz_topics;
drop policy if exists "Admins can manage lesson quiz topics" on public.lesson_quiz_topics;
create policy "Anyone can read lesson quiz topics"
on public.lesson_quiz_topics for select to anon, authenticated using (true);

drop policy if exists "Anyone can read course projects" on public.course_projects;
drop policy if exists "Admins can manage course projects" on public.course_projects;
create policy "Anyone can read course projects"
on public.course_projects for select to anon, authenticated using (true);

do $$
declare
  table_name text;
  action_name text;
begin
  foreach table_name in array array[
    'courses', 'lessons', 'lesson_metadata', 'quiz_questions',
    'lesson_quiz_topics', 'course_projects'
  ]
  loop
    foreach action_name in array array['insert', 'update', 'delete']
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        'Admins can ' || action_name || ' ' || table_name,
        table_name
      );

      if action_name = 'insert' then
        execute format(
          'create policy %I on public.%I for insert to authenticated with check ((select private.is_admin()))',
          'Admins can insert ' || table_name,
          table_name
        );
      elsif action_name = 'update' then
        execute format(
          'create policy %I on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
          'Admins can update ' || table_name,
          table_name
        );
      else
        execute format(
          'create policy %I on public.%I for delete to authenticated using ((select private.is_admin()))',
          'Admins can delete ' || table_name,
          table_name
        );
      end if;
    end loop;
  end loop;
end;
$$;

drop policy if exists "Users can read own project submissions" on public.project_submissions;
drop policy if exists "Users can insert own project submissions" on public.project_submissions;
drop policy if exists "Users can update own project submissions" on public.project_submissions;
drop policy if exists "Admins can read all project submissions" on public.project_submissions;
drop policy if exists "Admins can update all project submissions" on public.project_submissions;

create policy "Users can read own project submissions"
on public.project_submissions for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));

create policy "Admins can update all project submissions"
on public.project_submissions for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Users read own mentor usage" on public.mentor_daily_usage;
create policy "Users read own mentor usage"
on public.mentor_daily_usage for select to authenticated
using ((select auth.uid()) = user_id);

-- Explicit Data API privileges are required for projects created after the
-- April 2026 Supabase Data API exposure change.
grant usage on schema public to anon, authenticated;

revoke all on public.profiles, public.user_progress, public.courses,
  public.lessons, public.lesson_metadata, public.quiz_questions,
  public.lesson_quiz_topics, public.course_projects,
  public.project_submissions, public.mentor_daily_usage,
  public.mentor_settings
from public;

grant select on public.courses, public.lessons, public.lesson_metadata,
  public.quiz_questions, public.lesson_quiz_topics, public.course_projects
to anon, authenticated;

grant insert, update, delete on public.courses, public.lessons, public.lesson_metadata,
  public.quiz_questions, public.lesson_quiz_topics, public.course_projects
to authenticated;

revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, auth_user_id, email, display_name) on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

revoke insert, update, delete on public.user_progress from anon, authenticated;
grant select on public.user_progress to authenticated;

revoke insert, delete on public.project_submissions from anon, authenticated;
revoke update on public.project_submissions from anon;
grant select, update on public.project_submissions to authenticated;

revoke all on public.mentor_daily_usage from anon;
revoke insert, update, delete on public.mentor_daily_usage from authenticated;
grant select on public.mentor_daily_usage to authenticated;
revoke all on public.mentor_settings from public, anon, authenticated;

create or replace function public.complete_lesson(p_lesson_id text, p_answers jsonb)
returns table(ok boolean, xp integer, level integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_id text;
  v_sort_order integer;
  v_prerequisite_id text;
  v_topic text;
  v_topic_count integer := 0;
  v_html_count integer := 0;
  v_required integer := 0;
  v_answered integer := 0;
  v_correct integer := 0;
  v_xp integer := 0;
  v_level integer := 1;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select lesson.course_id, lesson.sort_order
  into v_course_id, v_sort_order
  from public.lessons lesson
  where lesson.id = p_lesson_id;

  if v_course_id is null then
    raise exception 'unknown_lesson';
  end if;

  select previous_lesson.id
  into v_prerequisite_id
  from public.lessons previous_lesson
  where previous_lesson.course_id = v_course_id
    and previous_lesson.sort_order < v_sort_order
  order by previous_lesson.sort_order desc
  limit 1;

  if v_prerequisite_id is not null and not exists (
    select 1
    from public.user_progress progress
    where progress.user_id = v_user_id
      and progress.lesson_id = v_prerequisite_id
      and progress.completed
  ) then
    raise exception 'lesson_locked';
  end if;

  select mapping.topic
  into v_topic
  from public.lesson_quiz_topics mapping
  where mapping.lesson_id = p_lesson_id;

  if v_topic is null then
    raise exception 'quiz_unavailable';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception 'quiz_not_passed';
  end if;

  select count(*)::integer into v_topic_count
  from public.quiz_questions question
  where question.topic = v_topic;

  select count(*)::integer into v_html_count
  from public.quiz_questions question
  where question.topic = 'html';

  v_required := least(
    3,
    v_topic_count + case when v_topic <> 'html' and v_topic_count < 3 then v_html_count else 0 end
  );

  if v_required < 1 then
    raise exception 'quiz_unavailable';
  end if;

  with parsed_answers as (
    select distinct on (answer.value->>'questionId')
      answer.value->>'questionId' as question_id,
      (answer.value->>'selectedIndex')::integer as selected_index
    from jsonb_array_elements(p_answers) answer
    where jsonb_typeof(answer.value) = 'object'
      and coalesce(answer.value->>'questionId', '') <> ''
      and coalesce(answer.value->>'selectedIndex', '') ~ '^[0-9]+$'
    order by answer.value->>'questionId'
  ), valid_answers as (
    select parsed.question_id, parsed.selected_index, question.correct_index
    from parsed_answers parsed
    join public.quiz_questions question on question.id = parsed.question_id
    where question.topic = v_topic
      or (v_topic <> 'html' and v_topic_count < 3 and question.topic = 'html')
  )
  select
    count(*)::integer,
    count(*) filter (where selected_index = correct_index)::integer
  into v_answered, v_correct
  from valid_answers;

  if v_answered <> v_required or v_correct * 3 < v_required * 2 then
    raise exception 'quiz_not_passed';
  end if;

  insert into public.user_progress (
    user_id, lesson_id, completed, xp_earned, completed_at
  ) values (
    v_user_id, p_lesson_id, true, 100, now()
  )
  on conflict (user_id, lesson_id) do update
  set
    completed = true,
    xp_earned = 100,
    completed_at = coalesce(public.user_progress.completed_at, excluded.completed_at);

  select coalesce(sum(progress.xp_earned) filter (where progress.completed), 0)::integer
  into v_xp
  from public.user_progress progress
  where progress.user_id = v_user_id;

  v_level := case
    when v_xp >= 1000 then 5
    when v_xp >= 500 then 4
    when v_xp >= 250 then 3
    when v_xp >= 100 then 2
    else 1
  end;

  insert into public.profiles (id, auth_user_id, xp, level)
  values (v_user_id, v_user_id, v_xp, v_level)
  on conflict (id) do update set xp = excluded.xp, level = excluded.level;

  return query select true, v_xp, v_level;
end;
$$;

create or replace function public.merge_guest_progress(p_lesson_ids text[])
returns table(ok boolean, xp integer, level integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_first_lesson_id text;
  v_lesson_id text;
  v_xp integer := 0;
  v_level integer := 1;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select lesson.id
  into v_first_lesson_id
  from public.lessons lesson
  join public.courses course on course.id = lesson.course_id
  order by course.sort_order, lesson.sort_order
  limit 1;

  if coalesce(array_length(p_lesson_ids, 1), 0) > 1 then
    raise exception 'invalid_guest_progress';
  end if;

  foreach v_lesson_id in array coalesce(p_lesson_ids, array[]::text[])
  loop
    if v_lesson_id is distinct from v_first_lesson_id then
      raise exception 'invalid_guest_progress';
    end if;

    insert into public.user_progress (
      user_id, lesson_id, completed, xp_earned, completed_at
    ) values (
      v_user_id, v_lesson_id, true, 100, now()
    )
    on conflict (user_id, lesson_id) do update
    set
      completed = true,
      xp_earned = 100,
      completed_at = coalesce(public.user_progress.completed_at, excluded.completed_at);
  end loop;

  select coalesce(sum(progress.xp_earned) filter (where progress.completed), 0)::integer
  into v_xp
  from public.user_progress progress
  where progress.user_id = v_user_id;

  v_level := case
    when v_xp >= 1000 then 5
    when v_xp >= 500 then 4
    when v_xp >= 250 then 3
    when v_xp >= 100 then 2
    else 1
  end;

  insert into public.profiles (id, auth_user_id, xp, level)
  values (v_user_id, v_user_id, v_xp, v_level)
  on conflict (id) do update set xp = excluded.xp, level = excluded.level;

  return query select true, v_xp, v_level;
end;
$$;

create or replace function public.record_daily_visit()
returns table(streak integer, last_visit date)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_today date := (timezone('utc', now()))::date;
  v_streak integer;
  v_last_visit date;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.profiles (id, auth_user_id, streak_count, last_visit)
  values (v_user_id, v_user_id, 1, v_today)
  on conflict (id) do update
  set
    streak_count = case
      when public.profiles.last_visit = v_today then public.profiles.streak_count
      when public.profiles.last_visit = v_today - 1 then public.profiles.streak_count + 1
      else 1
    end,
    last_visit = v_today
  returning public.profiles.streak_count, public.profiles.last_visit
  into v_streak, v_last_visit;

  return query select v_streak, v_last_visit;
end;
$$;

create or replace function public.submit_project(
  p_project_id text,
  p_notes text,
  p_repo_url text,
  p_deploy_url text
)
returns table(ok boolean, project_id text, status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_project public.course_projects%rowtype;
  v_existing_status text;
  v_notes text := trim(coalesce(p_notes, ''));
  v_repo_url text := nullif(trim(coalesce(p_repo_url, '')), '');
  v_deploy_url text := nullif(trim(coalesce(p_deploy_url, '')), '');
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_project
  from public.course_projects project
  where project.id = p_project_id;

  if v_project.id is null then
    raise exception 'unknown_project';
  end if;

  if not exists (
    select 1
    from public.user_progress progress
    where progress.user_id = v_user_id
      and progress.lesson_id = v_project.after_lesson_id
      and progress.completed
  ) then
    raise exception 'project_locked';
  end if;

  if char_length(v_notes) < v_project.brief_min_length then
    raise exception 'brief_too_short';
  end if;

  if char_length(v_notes) > 10000 then
    raise exception 'brief_too_long';
  end if;

  if v_project.requires_repo and v_repo_url is null then
    raise exception 'repo_required';
  end if;

  if v_project.requires_deploy and v_deploy_url is null then
    raise exception 'deploy_required';
  end if;

  if v_repo_url is not null and (
    char_length(v_repo_url) > 2048 or v_repo_url !~* '^https?://'
  ) then
    raise exception 'invalid_repo_url';
  end if;

  if v_deploy_url is not null and (
    char_length(v_deploy_url) > 2048 or v_deploy_url !~* '^https?://'
  ) then
    raise exception 'invalid_deploy_url';
  end if;

  -- Serialize submissions for the same learner/project so two concurrent
  -- requests cannot race past the capstone status check.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_project_id, 0)
  );

  select submission.status
  into v_existing_status
  from public.project_submissions submission
  where submission.user_id = v_user_id
    and submission.project_id = p_project_id
  for update;

  if v_project.type = 'capstone' and v_existing_status in ('submitted', 'approved') then
    raise exception 'submission_locked';
  end if;

  insert into public.project_submissions (
    user_id,
    project_id,
    notes,
    repo_url,
    deploy_url,
    submitted_at,
    status,
    review_notes,
    reviewed_at,
    reviewed_by
  ) values (
    v_user_id,
    p_project_id,
    v_notes,
    v_repo_url,
    v_deploy_url,
    now(),
    'submitted',
    null,
    null,
    null
  )
  on conflict (user_id, project_id) do update
  set
    notes = excluded.notes,
    repo_url = excluded.repo_url,
    deploy_url = excluded.deploy_url,
    submitted_at = excluded.submitted_at,
    status = 'submitted',
    review_notes = null,
    reviewed_at = null,
    reviewed_by = null;

  return query select true, p_project_id, 'submitted'::text;
end;
$$;

drop function if exists public.get_mentor_usage(integer);
drop function if exists public.reserve_mentor_hint(integer);
drop function if exists public.release_mentor_hint();

create or replace function public.get_mentor_usage()
returns table(request_count integer, remaining integer, daily_limit integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_today date := (timezone('utc', now()))::date;
  v_limit integer := 5;
  v_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select settings.daily_limit into v_limit
  from public.mentor_settings settings
  where settings.singleton;

  select coalesce(usage.request_count, 0) into v_count
  from public.mentor_daily_usage usage
  where usage.user_id = v_user_id and usage.usage_date = v_today;

  return query select v_count, greatest(v_limit - v_count, 0), v_limit;
end;
$$;

create or replace function public.reserve_mentor_hint()
returns table(ok boolean, request_count integer, remaining integer, daily_limit integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_today date := (timezone('utc', now()))::date;
  v_limit integer := 5;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select settings.daily_limit into v_limit
  from public.mentor_settings settings
  where settings.singleton;

  insert into public.mentor_daily_usage (user_id, usage_date, request_count)
  values (v_user_id, v_today, 1)
  on conflict (user_id, usage_date) do update
  set request_count = public.mentor_daily_usage.request_count + 1
  where public.mentor_daily_usage.request_count < v_limit
  returning public.mentor_daily_usage.request_count into v_count;

  if v_count is null then
    select usage.request_count into v_count
    from public.mentor_daily_usage usage
    where usage.user_id = v_user_id and usage.usage_date = v_today;

    return query select false, coalesce(v_count, v_limit), 0, v_limit;
    return;
  end if;

  return query select true, v_count, greatest(v_limit - v_count, 0), v_limit;
end;
$$;

revoke all on function public.complete_lesson(text, jsonb) from public, anon;
revoke all on function public.merge_guest_progress(text[]) from public, anon;
revoke all on function public.record_daily_visit() from public, anon;
revoke all on function public.submit_project(text, text, text, text) from public, anon;
revoke all on function public.get_mentor_usage() from public, anon;
revoke all on function public.reserve_mentor_hint() from public, anon;

grant execute on function public.complete_lesson(text, jsonb) to authenticated;
grant execute on function public.merge_guest_progress(text[]) to authenticated;
grant execute on function public.record_daily_visit() to authenticated;
grant execute on function public.submit_project(text, text, text, text) to authenticated;
grant execute on function public.get_mentor_usage() to authenticated;
grant execute on function public.reserve_mentor_hint() to authenticated;

-- Trigger helpers should never be callable as public API functions.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    auth_user_id,
    email,
    display_name
  ) values (
    new.id,
    new.id,
    new.email,
    public.derive_profile_display_name(new.raw_user_meta_data, new.email)
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    auth_user_id = coalesce(public.profiles.auth_user_id, excluded.auth_user_id),
    display_name = coalesce(excluded.display_name, public.profiles.display_name);

  return new;
exception
  when others then
    raise exception 'handle_new_user failed for %: %', new.id, sqlerrm;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
do $$
begin
  if to_regprocedure('public.prevent_profile_role_escalation()') is not null then
    execute 'revoke all on function public.prevent_profile_role_escalation() from public, anon, authenticated';
  end if;
end;
$$;
grant execute on function public.handle_new_user() to postgres, supabase_auth_admin, service_role;
