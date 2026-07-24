import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseEnv } from "../supabase/env";
import { createClient } from "../supabase/server";
import { fallbackSchoolCurriculum } from "./data";
import { mapRowsToSchoolCurriculum } from "./helpers";
import { buildSchoolCurriculumSeedPayload } from "./seed-payload";
import type {
  CurriculumCourseLinkRow,
  CurriculumMissionRow,
  CurriculumModuleRow,
  SchoolCurriculum,
  SpecialtyRow
} from "./types";

async function loadSchoolCurriculumFromDatabase(): Promise<SchoolCurriculum | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const [specialtiesResult, modulesResult, missionsResult, linksResult] = await Promise.all([
    supabase.from("specialties").select("*").order("sort_order"),
    supabase.from("curriculum_modules").select("*").order("grade_level").order("sort_order"),
    supabase.from("curriculum_missions").select("*").order("id"),
    supabase.from("curriculum_course_links").select("*").order("sort_order")
  ]);

  if (specialtiesResult.error || modulesResult.error || missionsResult.error || linksResult.error) {
    return null;
  }

  const specialties = (specialtiesResult.data ?? []) as SpecialtyRow[];
  const modules = (modulesResult.data ?? []) as CurriculumModuleRow[];
  const missions = (missionsResult.data ?? []) as CurriculumMissionRow[];
  const links = (linksResult.data ?? []) as CurriculumCourseLinkRow[];
  if (specialties.length === 0 || modules.length === 0 || missions.length === 0 || links.length === 0) {
    return null;
  }

  return mapRowsToSchoolCurriculum(specialties, modules, missions, links);
}

export async function getSchoolCurriculum() {
  return (await loadSchoolCurriculumFromDatabase()) ?? fallbackSchoolCurriculum;
}

export async function seedSchoolCurriculumToDatabase() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env is not configured.");
  }

  const supabase = await createClient();
  const { specialties, modules, missions, courseLinks } = buildSchoolCurriculumSeedPayload();
  const now = new Date().toISOString();

  const { error: specialtiesError } = await supabase
    .from("specialties")
    .upsert(specialties.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });
  if (specialtiesError) {
    throw new Error(specialtiesError.message);
  }

  const { error: modulesError } = await supabase
    .from("curriculum_modules")
    .upsert(modules.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });
  if (modulesError) {
    throw new Error(modulesError.message);
  }

  const { error: missionsError } = await supabase
    .from("curriculum_missions")
    .upsert(missions.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });
  if (missionsError) {
    throw new Error(missionsError.message);
  }

  const { error: linksError } = await supabase
    .from("curriculum_course_links")
    .upsert(courseLinks, { onConflict: "module_id,course_id" });
  if (linksError) {
    throw new Error(linksError.message);
  }

  return {
    specialties: specialties.length,
    curriculumModules: modules.length,
    curriculumMissions: missions.length,
    curriculumCourseLinks: courseLinks.length
  };
}

export { fallbackSchoolCurriculum } from "./data";
export {
  getCommonModules,
  getCourseIdsForSpecialty,
  getMissionForModule,
  getMissionsForModule,
  getMissionsForModules,
  getSpecialtyModules,
  localizeCurriculumText,
  mapRowsToSchoolCurriculum
} from "./helpers";
export { buildSchoolCurriculumSeedPayload } from "./seed-payload";
export type {
  CurriculumMission,
  CurriculumModule,
  GradeLevel,
  SchoolCurriculum,
  SchoolSpecialty
} from "./types";
