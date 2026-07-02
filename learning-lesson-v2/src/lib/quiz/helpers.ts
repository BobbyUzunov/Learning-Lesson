import type { Language } from "../i18n";
import type { QuizContent, QuizQuestion, QuizTopic } from "./types";

export function getQuizTopicForLesson(content: QuizContent, lessonId: string): QuizTopic {
  return content.lessonTopics[lessonId] ?? "html";
}

export function localizeQuizQuestion(question: QuizQuestion, language: Language) {
  if (language === "en") {
    return {
      id: question.id,
      question: question.question,
      options: question.options,
      explanation: question.explanation
    };
  }

  return {
    id: question.id,
    question: question.questionBg,
    options: question.optionsBg,
    explanation: question.explanationBg
  };
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function generateQuizQuestions(content: QuizContent, topic: QuizTopic, count = 3) {
  const pool = content.questions.filter((item) => item.topic === topic);
  const fallback = content.questions.filter((item) => item.topic === "html");
  const source = pool.length >= count ? pool : [...pool, ...fallback];
  return shuffle(source).slice(0, Math.min(count, source.length));
}

export function getQuestionBankSize(content: QuizContent, topic: QuizTopic) {
  return content.questions.filter((item) => item.topic === topic).length;
}

export function getQuizQuestionById(content: QuizContent, id: string) {
  return content.questions.find((item) => item.id === id);
}

export function mapQuizRowsToContent(
  questionRows: QuizContent["questions"],
  topicRows: Array<{ lesson_id: string; topic: string }>
): QuizContent {
  return {
    questions: questionRows,
    lessonTopics: Object.fromEntries(topicRows.map((row) => [row.lesson_id, row.topic as QuizTopic])),
    source: "db"
  };
}
