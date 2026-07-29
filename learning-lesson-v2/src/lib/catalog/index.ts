import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { getFallbackCatalog } from "./fallback";
import { getLessonFromCatalog, mapRowsToCatalog } from "./helpers";
import type { CourseCatalog, CourseRow, LessonMetadataRow, LessonRow } from "./types";

const courseColumns =
  "id, title, title_bg, description, description_bg, difficulty, difficulty_bg, estimated_time, estimated_time_bg, reward_badge, reward_badge_bg, xp_reward, sort_order";
const lessonColumns =
  "id, course_id, sort_order, title, title_bg, explanation, explanation_bg, code_example, mission, mission_bg, solution, hint1, hint1_bg, hint2, hint2_bg, hint3, hint3_bg";
const metadataColumns =
  "lesson_id, learning_objectives, learning_objectives_bg, prerequisites, prerequisites_bg, key_concepts, key_concepts_bg, reading_time_minutes";

async function loadCatalogFromDatabase(): Promise<CourseCatalog | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const [coursesResult, lessonsResult, metadataResult] = await Promise.all([
    supabase.from("courses").select(courseColumns).order("sort_order"),
    supabase.from("lessons").select(lessonColumns).order("course_id").order("sort_order"),
    supabase.from("lesson_metadata").select(metadataColumns)
  ]);

  if (coursesResult.error) {
    console.error("Failed to load courses:", coursesResult.error.message);
    return null;
  }

  if (lessonsResult.error) {
    console.error("Failed to load lessons:", lessonsResult.error.message);
    return null;
  }

  if (metadataResult.error) {
    console.error("Failed to load lesson metadata:", metadataResult.error.message);
    return null;
  }

  const courseRows = (coursesResult.data ?? []) as CourseRow[];
  if (courseRows.length === 0) {
    return null;
  }

  return mapRowsToCatalog(
    courseRows,
    (lessonsResult.data ?? []) as LessonRow[],
    (metadataResult.data ?? []) as LessonMetadataRow[]
  );
}

async function loadCourseCatalog(): Promise<CourseCatalog> {
  const fromDatabase = await loadCatalogFromDatabase();
  return fromDatabase ?? getFallbackCatalog();
}

export const getCourseCatalog = cache(loadCourseCatalog);

export async function getCatalogLessons() {
  const catalog = await getCourseCatalog();
  return catalog.lessons;
}

export async function getCatalogLesson(id: string) {
  const catalog = await getCourseCatalog();
  return getLessonFromCatalog(catalog, id) ?? null;
}

export type { CourseCatalog, CourseCatalogSource } from "./types";
export {
  getFirstLesson,
  getGlobalNextLesson,
  getGlobalNextLessonFromCourses,
  getLessonFromCatalog,
  getLessonModuleIndex,
  getLessonOrderInQuest,
  getLessonUnlockRule,
  getNextLessonInQuest,
  getQuestForLesson,
  getQuestFromCatalog,
  getQuestLessons,
  getTotalAvailableXp,
  isLessonUnlocked,
  mapRowsToCatalog
} from "./helpers";
export { getFallbackCatalog } from "./fallback";
