import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { hasSupabaseDataEnv } from "../supabase/data-env";
import { throwLoadError } from "../supabase/load-error";
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

async function loadProjectsFromDatabase(): Promise<CourseProjectsContent> {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.from("course_projects").select(projectColumns).order("sort_order");

  if (error) {
    throwLoadError("course_projects_unavailable", error);
  }

  // Empty catalog is valid — do not substitute certificate requirements from seed.
  return {
    projects: mapProjectRows((data ?? []) as CourseProjectRow[]),
    source: "db"
  };
}

async function loadCourseProjects(): Promise<CourseProjectsContent> {
  if (!hasSupabaseDataEnv()) {
    return getFallbackProjects();
  }

  return loadProjectsFromDatabase();
}

export const getCourseProjects = cache(loadCourseProjects);
