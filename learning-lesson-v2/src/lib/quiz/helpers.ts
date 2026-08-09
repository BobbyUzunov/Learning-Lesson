import type { Language } from "../i18n";
import type {
  KnowledgeCheckAnswer,
  KnowledgeCheckContent,
  KnowledgeCheckQuestion,
  KnowledgeCheckTopic,
  ShuffledKnowledgeCheckQuestion
} from "./types";

export function getKnowledgeCheckTopicForLesson(
  content: KnowledgeCheckContent,
  lessonId: string
): KnowledgeCheckTopic | null {
  return content.lessonTopics[lessonId] ?? null;
}

export function localizeKnowledgeCheckQuestion(question: KnowledgeCheckQuestion, language: Language) {
  if (language === "en") {
    return {
      id: question.id,
      question: question.question,
      options: question.options,
      explanation: question.explanation ?? ""
    };
  }

  return {
    id: question.id,
    question: question.questionBg,
    options: question.optionsBg,
    explanation: question.explanationBg ?? question.explanation ?? ""
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function shuffleQuestionOptions(
  question: KnowledgeCheckQuestion,
  random: () => number
): ShuffledKnowledgeCheckQuestion {
  const optionOrder = shuffle(
    question.options.map((_, index) => index),
    random
  );

  return {
    ...question,
    options: optionOrder.map((index) => question.options[index]),
    optionsBg: optionOrder.map((index) => question.optionsBg[index]),
    correctIndex:
      question.correctIndex === undefined ? undefined : optionOrder.indexOf(question.correctIndex),
    originalOptionIndexes: optionOrder
  };
}

export function createKnowledgeCheckAnswer(
  question: ShuffledKnowledgeCheckQuestion,
  displayedOptionIndex: number
): KnowledgeCheckAnswer {
  return {
    questionId: question.id,
    selectedIndex: question.originalOptionIndexes[displayedOptionIndex]
  };
}

export function createSeededRandom(seed: string) {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateKnowledgeCheckQuestions(
  content: KnowledgeCheckContent,
  topic: KnowledgeCheckTopic,
  count = 3,
  random: () => number = Math.random
) {
  const topicPool = content.questions.filter((item) => item.topic === topic);
  const fallbackPool =
    topic !== "html" && topicPool.length < count
      ? content.questions.filter((item) => item.topic === "html")
      : [];
  const pool = [...topicPool, ...fallbackPool];

  return shuffle(pool, random)
    .slice(0, Math.min(count, pool.length))
    .map((question) => shuffleQuestionOptions(question, random));
}

export function getQuestionBankSize(content: KnowledgeCheckContent, topic: KnowledgeCheckTopic) {
  return content.questions.filter((item) => item.topic === topic).length;
}

const topicLabels: Record<KnowledgeCheckTopic, { bg: string; en: string }> = {
  html: { bg: "HTML", en: "HTML" },
  css: { bg: "CSS", en: "CSS" },
  javascript: { bg: "JavaScript", en: "JavaScript" },
  dom: { bg: "DOM", en: "DOM" },
  fetch: { bg: "Fetch API", en: "Fetch API" },
  react: { bg: "React", en: "React" },
  api: { bg: "API и сървър", en: "APIs and servers" },
  "quiz-generator": { bg: "Дизайн на самопроверка", en: "Knowledge-check design" },
  fullstack: { bg: "Full-stack", en: "Full-stack" },
  ai: { bg: "Изкуствен интелект", en: "Artificial intelligence" },
  mobile: { bg: "Мобилни приложения", en: "Mobile applications" },
  product: { bg: "Дигитален продукт", en: "Digital product" }
};

export function getKnowledgeCheckTopicLabel(topic: KnowledgeCheckTopic, language: Language) {
  return topicLabels[topic][language];
}

export function mapKnowledgeCheckRowsToContent(
  questionRows: KnowledgeCheckContent["questions"],
  topicRows: Array<{ lesson_id: string; topic: string }>
): KnowledgeCheckContent {
  return {
    questions: questionRows,
    lessonTopics: Object.fromEntries(
      topicRows.map((row) => [row.lesson_id, row.topic as KnowledgeCheckTopic])
    ),
    source: "db"
  };
}

/** Strip answer keys and explanations before sending question banks to learners. */
export function toPublicKnowledgeCheckContent(content: KnowledgeCheckContent): KnowledgeCheckContent {
  return {
    source: content.source,
    lessonTopics: content.lessonTopics,
    questions: content.questions.map((question) => ({
      id: question.id,
      topic: question.topic,
      question: question.question,
      questionBg: question.questionBg,
      options: question.options,
      optionsBg: question.optionsBg
    }))
  };
}

// Legacy aliases keep cached builds and old internal imports compatible during the rename.
export const getQuizTopicForLesson = getKnowledgeCheckTopicForLesson;
export const localizeQuizQuestion = localizeKnowledgeCheckQuestion;
export const createQuizAnswer = createKnowledgeCheckAnswer;
export const generateQuizQuestions = generateKnowledgeCheckQuestions;
export const mapQuizRowsToContent = mapKnowledgeCheckRowsToContent;
