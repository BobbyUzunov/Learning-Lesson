import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { fallbackQuestionBank, fallbackLessonTopicMap } from "./fallback-data";
import { mapQuizRowsToContent } from "./helpers";
import type { QuizContent, QuizQuestion, QuizQuestionRow, QuizTopic } from "./types";

const questionColumns =
  "id, topic, question, question_bg, options, options_bg, correct_index, explanation, explanation_bg";

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
    supabase.from("quiz_questions").select(questionColumns).order("topic").order("id"),
    supabase.from("lesson_quiz_topics").select("lesson_id, topic")
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

async function loadQuizContent(): Promise<QuizContent> {
  return (await loadQuizFromDatabase()) ?? getFallbackQuizContent();
}

export const getQuizContent = cache(loadQuizContent);

export type { QuizContent, QuizQuestion, QuizTopic } from "./types";
export {
  createSeededRandom,
  generateQuizQuestions,
  getQuestionBankSize,
  getQuizTopicForLesson,
  localizeQuizQuestion
} from "./helpers";
