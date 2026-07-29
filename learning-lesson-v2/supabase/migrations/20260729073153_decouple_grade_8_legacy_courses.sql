-- Grade 8 missions are self-contained curriculum activities. The former
-- module-to-course links pointed to optional, advanced technology labs and
-- could send students to an unrelated first lesson.
delete from public.curriculum_course_links as link
where exists (
  select 1
  from public.curriculum_modules as module
  where module.id = link.module_id
    and module.grade_level = 8
);
