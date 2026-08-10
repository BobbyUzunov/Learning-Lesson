import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseEnv } from "../supabase/env";
import { createClient } from "../supabase/server";
import { fallbackSchoolCurriculum } from "./data";
import { mapRowsToSchoolCurriculum } from "./helpers";
import type {
  CurriculumMissionRow,
  CurriculumModuleRow,
  SchoolCurriculum,
  SpecialtyRow
} from "./types";

const specialtyColumns =
  "id, profession_code, title, title_bg, description, description_bg, accent, icon, source_url, sort_order";
const moduleColumns =
  "id, specialty_id, grade_level, module_type, status, title, title_bg, description, description_bg, learning_outcomes, learning_outcomes_bg, theory_hours, practice_hours, source_url, sort_order";
const missionColumns =
  "id, module_id, title, title_bg, brief, brief_bg, deliverable, deliverable_bg, skills, skills_bg, estimated_minutes, sort_order";

async function loadSchoolCurriculumFromDatabase(): Promise<SchoolCurriculum | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const [specialtiesResult, modulesResult, missionsResult] = await Promise.all([
    supabase.from("specialties").select(specialtyColumns).order("sort_order"),
    supabase.from("curriculum_modules").select(moduleColumns).order("grade_level").order("sort_order"),
    supabase.from("curriculum_missions").select(missionColumns).order("id")
  ]);

  if (specialtiesResult.error || modulesResult.error || missionsResult.error) {
    return null;
  }

  const specialties = (specialtiesResult.data ?? []) as SpecialtyRow[];
  const modules = (modulesResult.data ?? []) as CurriculumModuleRow[];
  const missions = (missionsResult.data ?? []) as CurriculumMissionRow[];
  if (specialties.length === 0 || modules.length === 0 || missions.length === 0) {
    return null;
  }

  return mapRowsToSchoolCurriculum(specialties, modules, missions);
}

async function loadSchoolCurriculum() {
  return (await loadSchoolCurriculumFromDatabase()) ?? fallbackSchoolCurriculum;
}

export const getSchoolCurriculum = cache(loadSchoolCurriculum);

export { fallbackSchoolCurriculum } from "./data";
export {
  fallbackCurriculumMissionLabs,
  getCurriculumMissionLabs,
  getMissionLabLinks,
  mapCurriculumMissionLabRows,
  resolveCurriculumMissionLabs
} from "./labs";
export {
  getCommonModules,
  getMissionForModule,
  getMissionsForModule,
  getMissionsForModules,
  getSpecialtyModules,
  localizeCurriculumText,
  mapRowsToSchoolCurriculum
} from "./helpers";
export { resolveMissionAssignmentState } from "./mission-state";
export type {
  CurriculumMission,
  CurriculumMissionLab,
  CurriculumModule,
  GradeLevel,
  SchoolCurriculum,
  SchoolSpecialty
} from "./types";
