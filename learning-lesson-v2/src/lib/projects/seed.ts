import { hasSupabaseEnv } from "../supabase/env";
import { createClient } from "../supabase/server";
import { buildProjectsSeedPayload } from "./seed-payload";

export async function seedProjectsToDatabase() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env is not configured.");
  }

  const supabase = await createClient();
  const { projects } = buildProjectsSeedPayload();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("course_projects")
    .upsert(projects.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });

  if (error) throw new Error(error.message);

  return { projects: projects.length };
}
