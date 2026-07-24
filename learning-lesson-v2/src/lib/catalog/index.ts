import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { getFallbackCatalog } from "./fallback";
import { getLessonFromCatalog, mapRowsToCatalog } from "./helpers";
import { seedProjectsToDatabase } from "../projects/store";
import { seedQuizToDatabase } from "../quiz";
import { buildCatalogSeedPayload } from "./seed-payload";
import { seedSchoolCurriculumToDatabase } from "../curriculum";
import type { CourseCatalog, CourseRow, LessonMetadataRow, LessonRow } from "./types";

async function loadCatalogFromDatabase(): Promise<CourseCatalog | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const [coursesResult, lessonsResult, metadataResult] = await Promise.all([
    supabase.from("courses").select("*").order("sort_order"),
    supabase.from("lessons").select("*").order("course_id").order("sort_order"),
    supabase.from("lesson_metadata").select("*")
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

export async function getCourseCatalog(): Promise<CourseCatalog> {
  const fromDatabase = await loadCatalogFromDatabase();
  return fromDatabase ?? getFallbackCatalog();
}

export async function getCatalogLessons() {
  const catalog = await getCourseCatalog();
  return catalog.lessons;
}

export async function getCatalogLesson(id: string) {
  const catalog = await getCourseCatalog();
  return getLessonFromCatalog(catalog, id) ?? null;
}

export async function seedCatalogToDatabase() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env is not configured.");
  }

  const supabase = await createClient();
  const { courses, lessons, metadataRows } = buildCatalogSeedPayload();
  const now = new Date().toISOString();

  const courseRows = courses.map((row) => ({ ...row, updated_at: now }));
  const lessonRows = lessons.map((row) => ({ ...row, updated_at: now }));
  const metadata = metadataRows.map((row) => ({ ...row, updated_at: now }));

  const { error: coursesError } = await supabase.from("courses").upsert(courseRows, { onConflict: "id" });
  if (coursesError) {
    throw new Error(coursesError.message);
  }

  const { error: lessonsError } = await supabase.from("lessons").upsert(lessonRows, { onConflict: "id" });
  if (lessonsError) {
    throw new Error(lessonsError.message);
  }

  const { error: metadataError } = await supabase.from("lesson_metadata").upsert(metadata, { onConflict: "lesson_id" });
  if (metadataError) {
    throw new Error(metadataError.message);
  }

  return {
    courses: courses.length,
    lessons: lessons.length,
    metadata: metadataRows.length
  };
}

export async function seedAllContentToDatabase() {
  const catalog = await seedCatalogToDatabase();
  const [quiz, projects, curriculum] = await Promise.all([
    seedQuizToDatabase(),
    seedProjectsToDatabase(),
    seedSchoolCurriculumToDatabase()
  ]);

  return {
    ...catalog,
    quizQuestions: quiz.questions,
    lessonQuizTopics: quiz.lessonTopics,
    projects: projects.projects,
    ...curriculum
  };
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
export { buildCatalogSeedPayload } from "./seed-payload";
