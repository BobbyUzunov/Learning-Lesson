export {
  createKnowledgeCheckAnswer,
  createSeededRandom,
  generateKnowledgeCheckQuestions,
  getFallbackKnowledgeCheckContent,
  getKnowledgeCheckContent,
  getKnowledgeCheckTopicForLesson,
  getQuestionBankSize,
  getUnavailableKnowledgeCheckContent,
  localizeKnowledgeCheckQuestion
} from "@/lib/quiz";

export type {
  KnowledgeCheckAnswer,
  KnowledgeCheckAttempt,
  KnowledgeCheckContent,
  KnowledgeCheckContentSource,
  KnowledgeCheckQuestion,
  KnowledgeCheckQuestionRow,
  KnowledgeCheckTopic,
  LessonKnowledgeCheckTopicRow,
  ShuffledKnowledgeCheckQuestion
} from "@/lib/quiz/types";
