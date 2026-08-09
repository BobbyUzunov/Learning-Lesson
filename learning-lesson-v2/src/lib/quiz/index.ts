import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { isE2eAuthEnabled } from "../supabase/e2e-auth";
import { createClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import { fallbackKnowledgeCheckBank, fallbackLessonKnowledgeCheckMap } from "./fallback-data";
import { mapKnowledgeCheckRowsToContent, toPublicKnowledgeCheckContent } from "./helpers";
import type {
  KnowledgeCheckContent,
  KnowledgeCheckQuestion,
  KnowledgeCheckQuestionRow,
  KnowledgeCheckTopic
} from "./types";

const secretQuestionColumns =
  "id, topic, question, question_bg, options, options_bg, correct_index, explanation, explanation_bg";

type PublicQuestionRow = {
  id: string;
  topic: string;
  question: string;
  question_bg: string;
  options: string[];
  options_bg: string[];
};

function mapSecretRows(questionRows: KnowledgeCheckQuestionRow[]): KnowledgeCheckQuestion[] {
  return questionRows.map((row) => ({
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
}

function mapPublicRows(questionRows: PublicQuestionRow[]): KnowledgeCheckQuestion[] {
  return questionRows.map((row) => ({
    id: row.id,
    topic: row.topic as KnowledgeCheckTopic,
    question: row.question,
    questionBg: row.question_bg,
    options: Array.isArray(row.options) ? row.options.filter((item): item is string => typeof item === "string") : [],
    optionsBg: Array.isArray(row.options_bg)
      ? row.options_bg.filter((item): item is string => typeof item === "string")
      : []
  }));
}

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

async function loadLessonTopics(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Array<{ lesson_id: string; topic: string }> | null> {
  const topicsResult = await supabase.from("lesson_quiz_topics").select("lesson_id, topic");
  if (topicsResult.error) {
    console.error("Failed to load lesson knowledge-check topics:", topicsResult.error.message);
    return null;
  }

  return (topicsResult.data ?? []).map((row) => ({
    lesson_id: row.lesson_id as string,
    topic: row.topic as string
  }));
}

/** Full bank with answer keys — admin CMS and server-side grading only. */
async function loadSecretKnowledgeCheckFromDatabase(): Promise<KnowledgeCheckContent | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const [questionsResult, topicRows] = await Promise.all([
    supabase.from("quiz_questions").select(secretQuestionColumns).order("topic").order("id"),
    loadLessonTopics(supabase)
  ]);

  if (questionsResult.error) {
    console.error("Failed to load knowledge-check questions:", questionsResult.error.message);
    return null;
  }

  if (!topicRows) {
    return null;
  }

  const questionRows = (questionsResult.data ?? []) as KnowledgeCheckQuestionRow[];
  if (questionRows.length === 0) {
    return null;
  }

  return mapKnowledgeCheckRowsToContent(mapSecretRows(questionRows), topicRows);
}

/** Learner-safe bank via security-definer RPC (no correct_index). */
async function loadPublicKnowledgeCheckFromDatabase(): Promise<KnowledgeCheckContent | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const topicRowsPromise = loadLessonTopics(supabase);
  const questionsResult = await supabase.rpc("get_knowledge_check_questions");
  const topicRows = await topicRowsPromise;

  if (!topicRows) {
    return null;
  }

  if (!questionsResult.error) {
    const questionRows = (questionsResult.data ?? []) as PublicQuestionRow[];
    if (questionRows.length === 0) {
      return null;
    }
    return mapKnowledgeCheckRowsToContent(mapPublicRows(questionRows), topicRows);
  }

  // Compatibility window if the RPC migration is not applied yet: select only
  // non-secret columns (and strip anything unexpected).
  console.error("Failed to load public knowledge-check questions via RPC:", questionsResult.error.message);
  const legacyResult = await supabase
    .from("quiz_questions")
    .select("id, topic, question, question_bg, options, options_bg")
    .order("topic")
    .order("id");

  if (legacyResult.error) {
    console.error("Failed to load legacy public knowledge-check questions:", legacyResult.error.message);
    return null;
  }

  const legacyRows = (legacyResult.data ?? []) as PublicQuestionRow[];
  if (legacyRows.length === 0) {
    return null;
  }

  return mapKnowledgeCheckRowsToContent(mapPublicRows(legacyRows), topicRows);
}

async function loadPublicKnowledgeCheckContent(): Promise<KnowledgeCheckContent> {
  if (!hasSupabaseEnv() || isE2eAuthEnabled()) {
    return toPublicKnowledgeCheckContent(getFallbackKnowledgeCheckContent());
  }

  return (await loadPublicKnowledgeCheckFromDatabase()) ?? getUnavailableKnowledgeCheckContent();
}

async function loadAdminKnowledgeCheckContent(): Promise<KnowledgeCheckContent> {
  if (!hasSupabaseEnv() || isE2eAuthEnabled()) {
    return getFallbackKnowledgeCheckContent();
  }

  return (await loadSecretKnowledgeCheckFromDatabase()) ?? getUnavailableKnowledgeCheckContent();
}

/** Secret bank for grading — never pass to client components. */
export async function getSecretKnowledgeCheckBank(): Promise<KnowledgeCheckQuestion[] | null> {
  if (!hasSupabaseEnv() || isE2eAuthEnabled()) {
    return getFallbackKnowledgeCheckContent().questions;
  }

  const content = await loadSecretKnowledgeCheckFromDatabase();
  return content?.questions.length ? content.questions : null;
}

export const getKnowledgeCheckContent = cache(loadPublicKnowledgeCheckContent);
export const getAdminKnowledgeCheckContent = cache(loadAdminKnowledgeCheckContent);

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
  localizeKnowledgeCheckQuestion,
  toPublicKnowledgeCheckContent
} from "./helpers";
export {
  gradeKnowledgeCheckAnswers,
  parseKnowledgeCheckAnswers,
  type KnowledgeCheckGradeResult,
  type KnowledgeCheckGradeResultItem
} from "./grade";
