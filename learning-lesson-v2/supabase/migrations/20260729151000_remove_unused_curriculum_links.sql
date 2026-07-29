-- Grade 8 curriculum missions are intentionally independent from the optional
-- legacy course labs. Refuse destructive cleanup if another environment still
-- contains links that need an explicit migration decision.

do $$
begin
  if exists (select 1 from public.curriculum_course_links) then
    raise exception 'curriculum_course_links_not_empty';
  end if;
end;
$$;

drop table public.curriculum_course_links;

drop function if exists private.is_teacher();

-- Remove indexes whose leading columns are already covered by an equivalent
-- unique/composite index. Keep student/reviewer indexes with a different lead.
drop index if exists public.lessons_course_id_sort_order_idx;
drop index if exists public.classroom_members_classroom_id_idx;
drop index if exists public.assignment_submissions_assignment_id_idx;
drop index if exists public.curriculum_missions_module_id_idx;
drop index if exists public.assessment_questions_assessment_idx;

-- Cover foreign-key columns reported by the Supabase database advisor.
create index if not exists classrooms_specialty_id_idx
  on public.classrooms (specialty_id);

create index if not exists role_change_audit_actor_id_idx
  on public.role_change_audit (actor_id);

create index if not exists classroom_assignments_assigned_by_idx
  on public.classroom_assignments (assigned_by);

create index if not exists assignment_submissions_reviewed_by_idx
  on public.assignment_submissions (reviewed_by);
