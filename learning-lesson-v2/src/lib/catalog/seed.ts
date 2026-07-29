import { seedSchoolCurriculumToDatabase } from "../curriculum/seed";
import { seedProjectsToDatabase } from "../projects/seed";
import { seedQuizToDatabase } from "../quiz/seed";
import { hasSupabaseEnv } from "../supabase/env";
import { createClient } from "../supabase/server";
import { buildCatalogSeedPayload } from "./seed-payload";

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

  const { error: metadataError } = await supabase
    .from("lesson_metadata")
    .upsert(metadata, { onConflict: "lesson_id" });
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
