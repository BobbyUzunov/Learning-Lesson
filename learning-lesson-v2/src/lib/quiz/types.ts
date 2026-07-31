export type KnowledgeCheckTopic =
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

export type KnowledgeCheckQuestion = {
  id: string;
  topic: KnowledgeCheckTopic;
  question: string;
  questionBg: string;
  options: string[];
  optionsBg: string[];
  correctIndex: number;
  explanation: string;
  explanationBg: string;
};

export type ShuffledKnowledgeCheckQuestion = KnowledgeCheckQuestion & {
  originalOptionIndexes: number[];
};

export type KnowledgeCheckAnswer = {
  questionId: string;
  selectedIndex: number;
};

export type KnowledgeCheckAttempt = {
  answers: KnowledgeCheckAnswer[];
  correct: number;
  total: number;
  passed: boolean;
};

export type KnowledgeCheckContentSource = "db" | "fallback" | "unavailable";

export type KnowledgeCheckContent = {
  questions: KnowledgeCheckQuestion[];
  lessonTopics: Record<string, KnowledgeCheckTopic>;
  source: KnowledgeCheckContentSource;
};

export type KnowledgeCheckQuestionRow = {
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

export type LessonKnowledgeCheckTopicRow = {
  lesson_id: string;
  topic: string;
};

// Compatibility aliases for the existing Supabase schema and cached app builds.
// The public product term is “Knowledge check”; the database still uses quiz_* names.
export type QuizTopic = KnowledgeCheckTopic;
export type QuizQuestion = KnowledgeCheckQuestion;
export type ShuffledQuizQuestion = ShuffledKnowledgeCheckQuestion;
export type QuizAnswer = KnowledgeCheckAnswer;
export type QuizAttempt = KnowledgeCheckAttempt;
export type QuizContentSource = KnowledgeCheckContentSource;
export type QuizContent = KnowledgeCheckContent;
export type QuizQuestionRow = KnowledgeCheckQuestionRow;
export type LessonQuizTopicRow = LessonKnowledgeCheckTopicRow;
