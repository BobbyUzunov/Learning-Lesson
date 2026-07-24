-- Classroom mission assignments with student submissions and teacher review.
-- Completes the teacher–student loop started in add_classrooms.sql.

-- 1) Tables
create table if not exists public.classroom_assignments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  mission_id text not null references public.curriculum_missions(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete cascade,
  title_override text,
  instructions text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (classroom_id, mission_id),
  constraint classroom_assignments_title_override_check
    check (title_override is null or char_length(btrim(title_override)) between 1 and 200),
  constraint classroom_assignments_instructions_check
    check (instructions is null or char_length(instructions) <= 2000)
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.classroom_assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft',
  deliverable_text text,
  deliverable_url text,
  teacher_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id),
  constraint assignment_submissions_status_check
    check (status in ('draft', 'submitted', 'approved', 'needs_changes')),
  constraint assignment_submissions_text_check
    check (deliverable_text is null or char_length(deliverable_text) <= 10000),
  constraint assignment_submissions_url_check
    check (deliverable_url is null or char_length(deliverable_url) <= 2000),
  constraint assignment_submissions_note_check
    check (teacher_note is null or char_length(teacher_note) <= 5000)
);

create index if not exists classroom_assignments_classroom_id_idx
  on public.classroom_assignments (classroom_id, created_at desc);
create index if not exists classroom_assignments_mission_id_idx
  on public.classroom_assignments (mission_id);
create index if not exists assignment_submissions_assignment_id_idx
  on public.assignment_submissions (assignment_id);
create index if not exists assignment_submissions_student_id_idx
  on public.assignment_submissions (student_id);

drop trigger if exists set_classroom_assignments_updated_at on public.classroom_assignments;
create trigger set_classroom_assignments_updated_at
before update on public.classroom_assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_assignment_submissions_updated_at on public.assignment_submissions;
create trigger set_assignment_submissions_updated_at
before update on public.assignment_submissions
for each row execute function public.set_updated_at();

-- 2) RLS
alter table public.classroom_assignments enable row level security;
alter table public.assignment_submissions enable row level security;

drop policy if exists "Teacher member admin can read assignments" on public.classroom_assignments;
create policy "Teacher member admin can read assignments"
on public.classroom_assignments for select to authenticated
using (
  (select private.is_admin())
  or (select private.is_classroom_teacher(classroom_id))
  or (select private.is_classroom_member(classroom_id))
);

drop policy if exists "Student teacher admin can read submissions" on public.assignment_submissions;
create policy "Student teacher admin can read submissions"
on public.assignment_submissions for select to authenticated
using (
  (select auth.uid()) = student_id
  or (select private.is_admin())
  or exists (
    select 1
    from public.classroom_assignments assignment
    where assignment.id = assignment_id
      and (select private.is_classroom_teacher(assignment.classroom_id))
  )
);

revoke all on table public.classroom_assignments from public, anon;
revoke all on table public.assignment_submissions from public, anon;
grant select on table public.classroom_assignments to authenticated;
grant select on table public.assignment_submissions to authenticated;

-- 3) Private implementations
create or replace function private.create_classroom_assignment(
  p_classroom_id uuid,
  p_mission_id text,
  p_due_at timestamptz,
  p_instructions text
)
returns table(
  id uuid,
  classroom_id uuid,
  mission_id text,
  due_at timestamptz,
  instructions text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_instructions text := nullif(btrim(coalesce(p_instructions, '')), '');
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from public.classrooms classroom
    where classroom.id = p_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1 from public.curriculum_missions mission where mission.id = p_mission_id
  ) then
    raise exception 'unknown_mission';
  end if;

  if v_instructions is not null and char_length(v_instructions) > 2000 then
    raise exception 'invalid_instructions';
  end if;

  insert into public.classroom_assignments (
    classroom_id, mission_id, assigned_by, instructions, due_at
  )
  values (p_classroom_id, p_mission_id, v_user_id, v_instructions, p_due_at)
  returning classroom_assignments.id into v_id;

  return query
  select
    assignment.id,
    assignment.classroom_id,
    assignment.mission_id,
    assignment.due_at,
    assignment.instructions,
    assignment.created_at
  from public.classroom_assignments assignment
  where assignment.id = v_id;
exception
  when unique_violation then
    raise exception 'assignment_exists';
end;
$$;

create or replace function private.submit_assignment(
  p_assignment_id uuid,
  p_deliverable_text text,
  p_deliverable_url text
)
returns table(
  id uuid,
  assignment_id uuid,
  status text,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
  v_text text := nullif(btrim(coalesce(p_deliverable_text, '')), '');
  v_url text := nullif(btrim(coalesce(p_deliverable_url, '')), '');
  v_submission_id uuid;
  v_submitted_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assignment.classroom_id into v_classroom_id
  from public.classroom_assignments assignment
  where assignment.id = p_assignment_id;

  if v_classroom_id is null then
    raise exception 'assignment_not_found';
  end if;

  if not (select private.is_classroom_member(v_classroom_id)) then
    raise exception 'not_authorized';
  end if;

  if v_text is null and v_url is null then
    raise exception 'deliverable_required';
  end if;

  if v_text is not null and char_length(v_text) > 10000 then
    raise exception 'invalid_deliverable_text';
  end if;

  if v_url is not null and char_length(v_url) > 2000 then
    raise exception 'invalid_deliverable_url';
  end if;

  if v_url is not null and v_url !~* '^https?://' then
    raise exception 'invalid_deliverable_url';
  end if;

  v_submitted_at := now();

  insert into public.assignment_submissions (
    assignment_id,
    student_id,
    status,
    deliverable_text,
    deliverable_url,
    teacher_note,
    reviewed_by,
    submitted_at,
    reviewed_at
  )
  values (
    p_assignment_id,
    v_user_id,
    'submitted',
    v_text,
    v_url,
    null,
    null,
    v_submitted_at,
    null
  )
  on conflict (assignment_id, student_id) do update
  set
    status = 'submitted',
    deliverable_text = excluded.deliverable_text,
    deliverable_url = excluded.deliverable_url,
    teacher_note = null,
    reviewed_by = null,
    submitted_at = excluded.submitted_at,
    reviewed_at = null
  returning assignment_submissions.id into v_submission_id;

  return query
  select
    submission.id,
    submission.assignment_id,
    submission.status,
    submission.submitted_at
  from public.assignment_submissions submission
  where submission.id = v_submission_id;
end;
$$;

create or replace function private.review_assignment_submission(
  p_submission_id uuid,
  p_status text,
  p_teacher_note text
)
returns table(
  id uuid,
  assignment_id uuid,
  status text,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_assignment_id uuid;
  v_classroom_id uuid;
  v_current_status text;
  v_note text := nullif(btrim(coalesce(p_teacher_note, '')), '');
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_status not in ('approved', 'needs_changes') then
    raise exception 'invalid_status';
  end if;

  if p_status = 'needs_changes' and (v_note is null or char_length(v_note) < 5) then
    raise exception 'teacher_note_required';
  end if;

  if v_note is not null and char_length(v_note) > 5000 then
    raise exception 'invalid_teacher_note';
  end if;

  select submission.assignment_id, submission.status, assignment.classroom_id
  into v_assignment_id, v_current_status, v_classroom_id
  from public.assignment_submissions submission
  join public.classroom_assignments assignment on assignment.id = submission.assignment_id
  where submission.id = p_submission_id;

  if v_assignment_id is null then
    raise exception 'submission_not_found';
  end if;

  if not exists (
    select 1 from public.classrooms classroom
    where classroom.id = v_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
    raise exception 'not_authorized';
  end if;

  if v_current_status not in ('submitted', 'approved', 'needs_changes') then
    raise exception 'not_ready_for_review';
  end if;

  update public.assignment_submissions submission
  set
    status = p_status,
    teacher_note = v_note,
    reviewed_by = v_user_id,
    reviewed_at = now()
  where submission.id = p_submission_id;

  return query
  select
    submission.id,
    submission.assignment_id,
    submission.status,
    submission.reviewed_at
  from public.assignment_submissions submission
  where submission.id = p_submission_id;
end;
$$;

create or replace function private.get_assignment_report(p_assignment_id uuid)
returns table(
  student_id uuid,
  display_name text,
  email text,
  submission_id uuid,
  status text,
  deliverable_text text,
  deliverable_url text,
  teacher_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_classroom_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select assignment.classroom_id into v_classroom_id
  from public.classroom_assignments assignment
  where assignment.id = p_assignment_id;

  if v_classroom_id is null then
    raise exception 'assignment_not_found';
  end if;

  if not exists (
    select 1 from public.classrooms classroom
    where classroom.id = v_classroom_id
      and (classroom.teacher_id = v_user_id or (select private.is_admin()))
  ) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    member.student_id,
    profile.display_name,
    profile.email,
    submission.id,
    coalesce(submission.status, 'missing')::text,
    submission.deliverable_text,
    submission.deliverable_url,
    submission.teacher_note,
    submission.submitted_at,
    submission.reviewed_at,
    member.joined_at
  from public.classroom_members member
  left join public.profiles profile on profile.id = member.student_id
  left join public.assignment_submissions submission
    on submission.assignment_id = p_assignment_id
   and submission.student_id = member.student_id
  where member.classroom_id = v_classroom_id
  order by profile.display_name nulls last, profile.email nulls last;
end;
$$;

-- 4) Public invoker wrappers
create or replace function public.create_classroom_assignment(
  p_classroom_id uuid,
  p_mission_id text,
  p_due_at timestamptz,
  p_instructions text
)
returns table(
  id uuid,
  classroom_id uuid,
  mission_id text,
  due_at timestamptz,
  instructions text,
  created_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_classroom_assignment($1, $2, $3, $4);
$$;

create or replace function public.submit_assignment(
  p_assignment_id uuid,
  p_deliverable_text text,
  p_deliverable_url text
)
returns table(
  id uuid,
  assignment_id uuid,
  status text,
  submitted_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.submit_assignment($1, $2, $3);
$$;

create or replace function public.review_assignment_submission(
  p_submission_id uuid,
  p_status text,
  p_teacher_note text
)
returns table(
  id uuid,
  assignment_id uuid,
  status text,
  reviewed_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.review_assignment_submission($1, $2, $3);
$$;

create or replace function public.get_assignment_report(p_assignment_id uuid)
returns table(
  student_id uuid,
  display_name text,
  email text,
  submission_id uuid,
  status text,
  deliverable_text text,
  deliverable_url text,
  teacher_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  joined_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_assignment_report($1);
$$;

revoke all on function private.create_classroom_assignment(uuid, text, timestamptz, text) from public, anon;
revoke all on function private.submit_assignment(uuid, text, text) from public, anon;
revoke all on function private.review_assignment_submission(uuid, text, text) from public, anon;
revoke all on function private.get_assignment_report(uuid) from public, anon;

grant execute on function private.create_classroom_assignment(uuid, text, timestamptz, text) to authenticated;
grant execute on function private.submit_assignment(uuid, text, text) to authenticated;
grant execute on function private.review_assignment_submission(uuid, text, text) to authenticated;
grant execute on function private.get_assignment_report(uuid) to authenticated;

revoke all on function public.create_classroom_assignment(uuid, text, timestamptz, text) from public, anon;
revoke all on function public.submit_assignment(uuid, text, text) from public, anon;
revoke all on function public.review_assignment_submission(uuid, text, text) from public, anon;
revoke all on function public.get_assignment_report(uuid) from public, anon;

grant execute on function public.create_classroom_assignment(uuid, text, timestamptz, text) to authenticated;
grant execute on function public.submit_assignment(uuid, text, text) to authenticated;
grant execute on function public.review_assignment_submission(uuid, text, text) to authenticated;
grant execute on function public.get_assignment_report(uuid) to authenticated;

comment on table public.classroom_assignments is
  'Teacher-assigned curriculum missions for a classroom; one mission per class.';
comment on table public.assignment_submissions is
  'Student deliverables for classroom assignments with teacher review states.';
