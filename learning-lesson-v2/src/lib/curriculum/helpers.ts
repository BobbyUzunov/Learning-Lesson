import type { Language } from "../i18n";
import type {
  CurriculumCourseLinkRow,
  CurriculumMissionRow,
  CurriculumModule,
  CurriculumModuleRow,
  LocalizedText,
  SchoolCurriculum,
  SpecialtyRow
} from "./types";

export function localizeCurriculumText(text: LocalizedText, language: Language) {
  return language === "bg" ? text.bg : text.en;
}

export function getActiveGradeLevel(curriculum: SchoolCurriculum): number {
  const pilotGrades = curriculum.modules
    .filter((module) => module.status === "pilot")
    .map((module) => module.gradeLevel);

  if (pilotGrades.length > 0) {
    return Math.min(...pilotGrades);
  }

  const allGrades = curriculum.modules.map((module) => module.gradeLevel);
  return allGrades.length > 0 ? Math.min(...allGrades) : 8;
}

export function getMissionMinutesRange(curriculum: SchoolCurriculum): string {
  const minutes = curriculum.missions.map((mission) => mission.estimatedMinutes).filter((value) => value > 0);

  if (minutes.length === 0) {
    return "45–60";
  }

  const min = Math.min(...minutes);
  const max = Math.max(...minutes);
  return min === max ? `${min}` : `${min}–${max}`;
}

export function getCommonModules(curriculum: SchoolCurriculum, gradeLevel: number) {
  return curriculum.modules
    .filter((module) => module.specialtyId === null && module.gradeLevel === gradeLevel)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getSpecialtyModules(curriculum: SchoolCurriculum, specialtyId: string, gradeLevel: number) {
  return curriculum.modules
    .filter((module) => module.specialtyId === specialtyId && module.gradeLevel === gradeLevel)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getMissionsForModule(curriculum: SchoolCurriculum, moduleId: string) {
  return curriculum.missions
    .filter((mission) => mission.moduleId === moduleId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getMissionForModule(curriculum: SchoolCurriculum, moduleId: string) {
  return getMissionsForModule(curriculum, moduleId)[0] ?? null;
}

export function getMissionsForModules(curriculum: SchoolCurriculum, modules: CurriculumModule[]) {
  return modules
    .map((module) => ({ module, missions: getMissionsForModule(curriculum, module.id) }))
    .filter((group) => group.missions.length > 0);
}

export function getCourseIdsForSpecialty(curriculum: SchoolCurriculum, specialtyId: string, gradeLevel: number) {
  const moduleIds = new Set(getSpecialtyModules(curriculum, specialtyId, gradeLevel).map((module) => module.id));

  return curriculum.courseLinks
    .filter((link) => moduleIds.has(link.moduleId))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((link) => link.courseId)
    .filter((courseId, index, courseIds) => courseIds.indexOf(courseId) === index);
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function mapRowsToSchoolCurriculum(
  specialtyRows: SpecialtyRow[],
  moduleRows: CurriculumModuleRow[],
  missionRows: CurriculumMissionRow[],
  courseLinkRows: CurriculumCourseLinkRow[]
): SchoolCurriculum {
  return {
    source: "db",
    specialties: specialtyRows
      .slice()
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((row) => ({
        id: row.id,
        professionCode: row.profession_code,
        title: { en: row.title, bg: row.title_bg },
        description: { en: row.description, bg: row.description_bg },
        accent: row.accent,
        icon: row.icon,
        sourceUrl: row.source_url,
        sortOrder: row.sort_order
      })),
    modules: moduleRows
      .slice()
      .sort((left, right) => left.grade_level - right.grade_level || left.sort_order - right.sort_order)
      .map((row) => {
        const outcomes = asStringArray(row.learning_outcomes);
        const outcomesBg = asStringArray(row.learning_outcomes_bg);

        return {
          id: row.id,
          specialtyId: row.specialty_id,
          gradeLevel: row.grade_level,
          type: row.module_type,
          status: row.status,
          title: { en: row.title, bg: row.title_bg },
          description: { en: row.description, bg: row.description_bg },
          learningOutcomes: outcomes.map((outcome, index) => ({
            en: outcome,
            bg: outcomesBg[index] ?? outcome
          })),
          theoryHours: row.theory_hours,
          practiceHours: row.practice_hours,
          sourceUrl: row.source_url,
          sortOrder: row.sort_order
        };
      }),
    missions: missionRows
      .slice()
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((row) => {
        const skills = asStringArray(row.skills);
        const skillsBg = asStringArray(row.skills_bg);

        return {
          id: row.id,
          moduleId: row.module_id,
          title: { en: row.title, bg: row.title_bg },
          brief: { en: row.brief, bg: row.brief_bg },
          deliverable: { en: row.deliverable, bg: row.deliverable_bg },
          skills: skills.map((skill, index) => ({ en: skill, bg: skillsBg[index] ?? skill })),
          estimatedMinutes: row.estimated_minutes,
          sortOrder: row.sort_order
        };
      }),
    courseLinks: courseLinkRows.map((row) => ({
      moduleId: row.module_id,
      courseId: row.course_id,
      sortOrder: row.sort_order
    }))
  };
}
