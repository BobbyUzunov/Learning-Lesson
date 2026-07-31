import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { isE2eAuthEnabled } from "../supabase/e2e-auth";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { fallbackKnowledgeCheckBank, fallbackLessonKnowledgeCheckMap } from "./fallback-data";
import { mapKnowledgeCheckRowsToContent } from "./helpers";
import type {
  KnowledgeCheckContent,
  KnowledgeCheckQuestion,
  KnowledgeCheckQuestionRow,
  KnowledgeCheckTopic
} from "./types";

const questionColumns =
  "id, topic, question, question_bg, options, options_bg, correct_index, explanation, explanation_bg";

export function getFallbackKnowledgeCheckContent(): KnowledgeCheckContent {
  return {
    questions: fallbackKnowledgeCheckBank,
    lessonTopics: fallbackLessonKnowledgeCheckMap,
    source: "fallback"
  };
}

export function getUnavailableKnowledgeCheckContent(): KnowledgeCheckContent {
  return {
    questions: [],
    lessonTopics: {},
    source: "unavailable"
  };
}

async function loadKnowledgeCheckFromDatabase(): Promise<KnowledgeCheckContent | null> {
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
    console.error("Failed to load knowledge-check questions:", questionsResult.error.message);
    return null;
  }

  if (topicsResult.error) {
    console.error("Failed to load lesson knowledge-check topics:", topicsResult.error.message);
    return null;
  }

  const questionRows = (questionsResult.data ?? []) as KnowledgeCheckQuestionRow[];
  if (questionRows.length === 0) {
    return null;
  }

  const questions: KnowledgeCheckQuestion[] = questionRows.map((row) => ({
    id: row.id,
    topic: row.topic as KnowledgeCheckTopic,
    question: row.question,
    questionBg: row.question_bg,
    options: row.options,
    optionsBg: row.options_bg,
    correctIndex: row.correct_index,
    explanation: row.explanation,
    explanationBg: row.explanation_bg
  }));

  return mapKnowledgeCheckRowsToContent(
    questions,
    (topicsResult.data ?? []).map((row) => ({ lesson_id: row.lesson_id as string, topic: row.topic as string }))
  );
}

async function loadKnowledgeCheckContent(): Promise<KnowledgeCheckContent> {
  if (!hasSupabaseEnv() || isE2eAuthEnabled()) {
    return getFallbackKnowledgeCheckContent();
  }

  return (await loadKnowledgeCheckFromDatabase()) ?? getUnavailableKnowledgeCheckContent();
}

export const getKnowledgeCheckContent = cache(loadKnowledgeCheckContent);

// Compatibility aliases for cached builds and internal modules using the previous name.
export const getFallbackQuizContent = getFallbackKnowledgeCheckContent;
export const getUnavailableQuizContent = getUnavailableKnowledgeCheckContent;
export const getQuizContent = getKnowledgeCheckContent;

export type {
  KnowledgeCheckContent,
  KnowledgeCheckQuestion,
  KnowledgeCheckTopic,
  QuizContent,
  QuizQuestion,
  QuizTopic
} from "./types";
export {
  createQuizAnswer,
  createKnowledgeCheckAnswer,
  createSeededRandom,
  generateQuizQuestions,
  generateKnowledgeCheckQuestions,
  getQuestionBankSize,
  getQuizTopicForLesson,
  getKnowledgeCheckTopicForLesson,
  localizeQuizQuestion,
  localizeKnowledgeCheckQuestion
} from "./helpers";
