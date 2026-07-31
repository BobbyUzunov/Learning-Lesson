import { fallbackKnowledgeCheckBank, fallbackLessonKnowledgeCheckMap } from "./fallback-data";
import type { KnowledgeCheckQuestionRow, LessonKnowledgeCheckTopicRow } from "./types";

export function buildKnowledgeCheckSeedPayload() {
  const questions: KnowledgeCheckQuestionRow[] = fallbackKnowledgeCheckBank.map((item) => ({
    id: item.id,
    topic: item.topic,
    question: item.question,
    question_bg: item.questionBg,
    options: item.options,
    options_bg: item.optionsBg,
    correct_index: item.correctIndex,
    explanation: item.explanation,
    explanation_bg: item.explanationBg
  }));

  const lessonTopics: LessonKnowledgeCheckTopicRow[] = Object.entries(
    fallbackLessonKnowledgeCheckMap
  ).map(([lessonId, topic]) => ({
    lesson_id: lessonId,
    topic
  }));

  return { questions, lessonTopics };
}

export const buildQuizSeedPayload = buildKnowledgeCheckSeedPayload;
