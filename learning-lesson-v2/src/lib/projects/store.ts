import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { fallbackCourseProjects } from "./fallback-data";
import { mapProjectRows } from "./helpers";
import type { CourseProjectRow, CourseProjectsContent } from "./types";

const projectColumns =
  "id, course_id, after_lesson_id, type, title, title_bg, description, description_bg, brief_label, brief_label_bg, brief_placeholder, brief_placeholder_bg, brief_min_length, requires_repo, requires_deploy, required_for_certificate, checklist, sort_order";

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
  const { data, error } = await supabase.from("course_projects").select(projectColumns).order("sort_order");

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

async function loadCourseProjects(): Promise<CourseProjectsContent> {
  return (await loadProjectsFromDatabase()) ?? getFallbackProjects();
}

export const getCourseProjects = cache(loadCourseProjects);
