import { fallbackSchoolCurriculum } from "./data";
import type {
  CurriculumCourseLinkRow,
  CurriculumMissionRow,
  CurriculumModuleRow,
  SpecialtyRow
} from "./types";

export function buildSchoolCurriculumSeedPayload() {
  const specialties: SpecialtyRow[] = fallbackSchoolCurriculum.specialties.map((specialty) => ({
    id: specialty.id,
    profession_code: specialty.professionCode,
    title: specialty.title.en,
    title_bg: specialty.title.bg,
    description: specialty.description.en,
    description_bg: specialty.description.bg,
    accent: specialty.accent,
    icon: specialty.icon,
    source_url: specialty.sourceUrl,
    sort_order: specialty.sortOrder
  }));

  const modules: CurriculumModuleRow[] = fallbackSchoolCurriculum.modules.map((module) => ({
    id: module.id,
    specialty_id: module.specialtyId,
    grade_level: module.gradeLevel,
    module_type: module.type,
    status: module.status,
    title: module.title.en,
    title_bg: module.title.bg,
    description: module.description.en,
    description_bg: module.description.bg,
    learning_outcomes: module.learningOutcomes.map((outcome) => outcome.en),
    learning_outcomes_bg: module.learningOutcomes.map((outcome) => outcome.bg),
    theory_hours: module.theoryHours,
    practice_hours: module.practiceHours,
    source_url: module.sourceUrl,
    sort_order: module.sortOrder
  }));

  const missions: CurriculumMissionRow[] = fallbackSchoolCurriculum.missions.map((mission) => ({
    id: mission.id,
    module_id: mission.moduleId,
    title: mission.title.en,
    title_bg: mission.title.bg,
    brief: mission.brief.en,
    brief_bg: mission.brief.bg,
    deliverable: mission.deliverable.en,
    deliverable_bg: mission.deliverable.bg,
    skills: mission.skills.map((skill) => skill.en),
    skills_bg: mission.skills.map((skill) => skill.bg),
    estimated_minutes: mission.estimatedMinutes,
    sort_order: mission.sortOrder
  }));

  const courseLinks: CurriculumCourseLinkRow[] = fallbackSchoolCurriculum.courseLinks.map((link) => ({
    module_id: link.moduleId,
    course_id: link.courseId,
    sort_order: link.sortOrder
  }));

  return { specialties, modules, missions, courseLinks };
}
