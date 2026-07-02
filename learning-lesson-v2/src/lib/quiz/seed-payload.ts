import { fallbackQuestionBank, fallbackLessonTopicMap } from "./fallback-data";
import type { LessonQuizTopicRow, QuizQuestionRow } from "./types";

export function buildQuizSeedPayload() {
  const questions: QuizQuestionRow[] = fallbackQuestionBank.map((item) => ({
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

  const lessonTopics: LessonQuizTopicRow[] = Object.entries(fallbackLessonTopicMap).map(([lessonId, topic]) => ({
    lesson_id: lessonId,
    topic
  }));

  return { questions, lessonTopics };
}
