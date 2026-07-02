export type QuizTopic =
  | "html"
  | "css"
  | "javascript"
  | "dom"
  | "fetch"
  | "react"
  | "api"
  | "quiz-generator"
  | "fullstack"
  | "ai"
  | "mobile"
  | "product";

export type QuizQuestion = {
  id: string;
  topic: QuizTopic;
  question: string;
  questionBg: string;
  options: string[];
  optionsBg: string[];
  correctIndex: number;
  explanation: string;
  explanationBg: string;
};

export type QuizContentSource = "db" | "fallback";

export type QuizContent = {
  questions: QuizQuestion[];
  lessonTopics: Record<string, QuizTopic>;
  source: QuizContentSource;
};

export type QuizQuestionRow = {
  id: string;
  topic: string;
  question: string;
  question_bg: string;
  options: string[];
  options_bg: string[];
  correct_index: number;
  explanation: string;
  explanation_bg: string;
};

export type LessonQuizTopicRow = {
  lesson_id: string;
  topic: string;
};
