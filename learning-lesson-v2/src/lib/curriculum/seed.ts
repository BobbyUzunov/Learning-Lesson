import { buildSchoolCurriculumSeedPayload } from "./seed-payload";
import { hasSupabaseEnv } from "../supabase/env";
import { createClient } from "../supabase/server";

export async function seedSchoolCurriculumToDatabase() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env is not configured.");
  }

  const supabase = await createClient();
  const { specialties, modules, missions } = buildSchoolCurriculumSeedPayload();
  const now = new Date().toISOString();

  const { error: specialtiesError } = await supabase
    .from("specialties")
    .upsert(specialties.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });
  if (specialtiesError) throw new Error(specialtiesError.message);

  const { error: modulesError } = await supabase
    .from("curriculum_modules")
    .upsert(modules.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });
  if (modulesError) throw new Error(modulesError.message);

  const { error: missionsError } = await supabase
    .from("curriculum_missions")
    .upsert(missions.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });
  if (missionsError) throw new Error(missionsError.message);

  return {
    specialties: specialties.length,
    curriculumModules: modules.length,
    curriculumMissions: missions.length
  };
}
