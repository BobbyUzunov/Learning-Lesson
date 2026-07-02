import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { fallbackCourseProjects } from "./fallback-data";
import { mapProjectRows } from "./helpers";
import { buildProjectsSeedPayload } from "./seed-payload";
import type { CourseProjectRow, CourseProjectsContent } from "./types";

export function getFallbackProjects(): CourseProjectsContent {
  return {
    projects: fallbackCourseProjects,
    source: "fallback"
  };
}

async function loadProjectsFromDatabase(): Promise<CourseProjectsContent | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.from("course_projects").select("*").order("sort_order");

  if (error) {
    console.error("Failed to load course projects:", error.message);
    return null;
  }

  const rows = (data ?? []) as CourseProjectRow[];
  if (rows.length === 0) {
    return null;
  }

  return {
    projects: mapProjectRows(rows),
    source: "db"
  };
}

export async function getCourseProjects(): Promise<CourseProjectsContent> {
  return (await loadProjectsFromDatabase()) ?? getFallbackProjects();
}

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

  if (error) {
    throw new Error(error.message);
  }

  return { projects: projects.length };
}
