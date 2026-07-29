import { hasSupabaseEnv } from "../supabase/env";
import { createClient } from "../supabase/server";
import { buildQuizSeedPayload } from "./seed-payload";

export async function seedQuizToDatabase() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env is not configured.");
  }

  const supabase = await createClient();
  const { questions, lessonTopics } = buildQuizSeedPayload();
  const now = new Date().toISOString();

  const { error: questionsError } = await supabase
    .from("quiz_questions")
    .upsert(questions.map((row) => ({ ...row, updated_at: now })), { onConflict: "id" });
  if (questionsError) throw new Error(questionsError.message);

  const { error: topicsError } = await supabase
    .from("lesson_quiz_topics")
    .upsert(lessonTopics.map((row) => ({ ...row, updated_at: now })), { onConflict: "lesson_id" });
  if (topicsError) throw new Error(topicsError.message);

  return {
    questions: questions.length,
    lessonTopics: lessonTopics.length
  };
}
