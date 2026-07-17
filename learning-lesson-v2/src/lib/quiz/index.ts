import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { fallbackQuestionBank, fallbackLessonTopicMap } from "./fallback-data";
import { mapQuizRowsToContent } from "./helpers";
import { buildQuizSeedPayload } from "./seed-payload";
import type { QuizContent, QuizQuestion, QuizQuestionRow, QuizTopic } from "./types";

export function getFallbackQuizContent(): QuizContent {
  return {
    questions: fallbackQuestionBank,
    lessonTopics: fallbackLessonTopicMap,
    source: "fallback"
  };
}

async function loadQuizFromDatabase(): Promise<QuizContent | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const [questionsResult, topicsResult] = await Promise.all([
    supabase.from("quiz_questions").select("*").order("topic").order("id"),
    supabase.from("lesson_quiz_topics").select("*")
  ]);

  if (questionsResult.error) {
    console.error("Failed to load quiz questions:", questionsResult.error.message);
    return null;
  }

  if (topicsResult.error) {
    console.error("Failed to load lesson quiz topics:", topicsResult.error.message);
    return null;
  }

  const questionRows = (questionsResult.data ?? []) as QuizQuestionRow[];
  if (questionRows.length === 0) {
    return null;
  }

  const questions: QuizQuestion[] = questionRows.map((row) => ({
    id: row.id,
    topic: row.topic as QuizTopic,
    question: row.question,
    questionBg: row.question_bg,
    options: row.options,
    optionsBg: row.options_bg,
    correctIndex: row.correct_index,
    explanation: row.explanation,
    explanationBg: row.explanation_bg
  }));

  return mapQuizRowsToContent(
    questions,
    (topicsResult.data ?? []).map((row) => ({ lesson_id: row.lesson_id as string, topic: row.topic as string }))
  );
}

export async function getQuizContent(): Promise<QuizContent> {
  return (await loadQuizFromDatabase()) ?? getFallbackQuizContent();
}

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

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  const { error: topicsError } = await supabase
    .from("lesson_quiz_topics")
    .upsert(lessonTopics.map((row) => ({ ...row, updated_at: now })), { onConflict: "lesson_id" });

  if (topicsError) {
    throw new Error(topicsError.message);
  }

  return {
    questions: questions.length,
    lessonTopics: lessonTopics.length
  };
}

export type { QuizContent, QuizQuestion, QuizTopic } from "./types";
export {
  createSeededRandom,
  generateQuizQuestions,
  getQuestionBankSize,
  getQuizQuestionById,
  getQuizTopicForLesson,
  localizeQuizQuestion
} from "./helpers";
