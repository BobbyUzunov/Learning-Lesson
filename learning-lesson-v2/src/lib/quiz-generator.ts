import {
  generateQuizQuestions as generateQuizQuestionsFromContent,
  getQuestionBankSize as getQuestionBankSizeFromContent,
  getQuizQuestionById as getQuizQuestionByIdFromContent,
  getQuizTopicForLesson as getQuizTopicForLessonFromContent,
  localizeQuizQuestion
} from "./quiz/helpers";
import { fallbackQuestionBank, fallbackLessonTopicMap } from "./quiz/fallback-data";
import type { QuizContent, QuizQuestion, QuizTopic } from "./quiz/types";

export type { QuizQuestion, QuizTopic };

export { localizeQuizQuestion };

const fallbackQuizContent: QuizContent = {
  questions: fallbackQuestionBank,
  lessonTopics: fallbackLessonTopicMap,
  source: "fallback"
};

export function getQuizTopicForLesson(lessonId: string): QuizTopic {
  return getQuizTopicForLessonFromContent(fallbackQuizContent, lessonId);
}

export function generateQuizQuestions(topic: QuizTopic, count = 3) {
  return generateQuizQuestionsFromContent(fallbackQuizContent, topic, count);
}

export function getQuestionBankSize(topic: QuizTopic) {
  return getQuestionBankSizeFromContent(fallbackQuizContent, topic);
}

export function getQuizQuestionById(id: string) {
  return getQuizQuestionByIdFromContent(fallbackQuizContent, id);
}
