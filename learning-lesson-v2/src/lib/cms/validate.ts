import type {
  CourseUpdateInput,
  KnowledgeCheckUpdateInput,
  LessonUpdateInput,
  ProjectUpdateInput
} from "./types";
import type { KnowledgeCheckTopic } from "@/lib/quiz/types";

type Validation<T> = { ok: true; value: T } | { ok: false; error: string };
type Rule = (value: unknown) => boolean;

const KNOWLEDGE_CHECK_TOPICS = new Set<KnowledgeCheckTopic>([
  "html",
  "css",
  "javascript",
  "dom",
  "fetch",
  "react",
  "api",
  "quiz-generator",
  "fullstack",
  "ai",
  "mobile",
  "product"
]);

const shortText: Rule = (value) => typeof value === "string" && value.length <= 500;
const longText: Rule = (value) => typeof value === "string" && value.length <= 20000;
const booleanValue: Rule = (value) => typeof value === "boolean";
const positiveInteger: Rule = (value) => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 1_000_000;
const nullableReadingTime: Rule = (value) => value === null || (Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 1440);
const stringList: Rule = (value) =>
  Array.isArray(value) &&
  value.length <= 100 &&
  value.every((item) => typeof item === "string" && item.length <= 2000);
const knowledgeCheckOptions: Rule = (value) =>
  stringList(value) && (value as string[]).length >= 2 && (value as string[]).length <= 10;

function validatePartial<T>(value: unknown, rules: Record<string, Rule>): Validation<T> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "invalid_json_object" };
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return { ok: false, error: "empty_update" };
  }

  for (const [key, fieldValue] of entries) {
    if (!rules[key] || !rules[key](fieldValue)) {
      return { ok: false, error: `invalid_${key}` };
    }
  }

  return { ok: true, value: value as T };
}

export function validateCourseUpdate(value: unknown): Validation<CourseUpdateInput> {
  return validatePartial(value, {
    title: shortText,
    titleBg: shortText,
    description: longText,
    descriptionBg: longText,
    difficulty: shortText,
    difficultyBg: shortText,
    estimatedTime: shortText,
    estimatedTimeBg: shortText,
    rewardBadge: shortText,
    rewardBadgeBg: shortText,
    xpReward: positiveInteger
  });
}

export function validateLessonUpdate(value: unknown): Validation<LessonUpdateInput> {
  return validatePartial(value, {
    title: shortText,
    titleBg: shortText,
    explanation: longText,
    explanationBg: longText,
    codeExample: longText,
    mission: longText,
    missionBg: longText,
    solution: longText,
    hint1: longText,
    hint1Bg: longText,
    hint2: longText,
    hint2Bg: longText,
    hint3: longText,
    hint3Bg: longText,
    learningObjectives: stringList,
    learningObjectivesBg: stringList,
    prerequisites: stringList,
    prerequisitesBg: stringList,
    keyConcepts: stringList,
    keyConceptsBg: stringList,
    readingTimeMinutes: nullableReadingTime
  });
}

const checklist: Rule = (value) =>
  Array.isArray(value) &&
  value.length <= 100 &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      typeof (item as Record<string, unknown>).id === "string" &&
      ((item as Record<string, unknown>).id as string).length <= 100 &&
      typeof (item as Record<string, unknown>).label === "string" &&
      ((item as Record<string, unknown>).label as string).length <= 1000 &&
      ((item as Record<string, unknown>).labelBg === undefined ||
        (typeof (item as Record<string, unknown>).labelBg === "string" &&
          ((item as Record<string, unknown>).labelBg as string).length <= 1000))
  );

export function validateProjectUpdate(value: unknown): Validation<ProjectUpdateInput> {
  return validatePartial(value, {
    afterLessonId: shortText,
    type: (item) => item === "mini" || item === "capstone",
    title: shortText,
    titleBg: shortText,
    description: longText,
    descriptionBg: longText,
    briefLabel: shortText,
    briefLabelBg: shortText,
    briefPlaceholder: longText,
    briefPlaceholderBg: longText,
    briefMinLength: (item) => Number.isInteger(item) && (item as number) >= 1 && (item as number) <= 10000,
    requiresRepo: booleanValue,
    requiresDeploy: booleanValue,
    requiredForCertificate: booleanValue,
    checklist
  });
}

export function validateKnowledgeCheckUpdate(value: unknown): Validation<KnowledgeCheckUpdateInput> {
  const base = validatePartial<KnowledgeCheckUpdateInput>(value, {
    topic: (item) => typeof item === "string" && KNOWLEDGE_CHECK_TOPICS.has(item as KnowledgeCheckTopic),
    question: longText,
    questionBg: longText,
    options: knowledgeCheckOptions,
    optionsBg: knowledgeCheckOptions,
    correctIndex: (item) => Number.isInteger(item) && (item as number) >= 0 && (item as number) <= 9,
    explanation: longText,
    explanationBg: longText
  });

  if (!base.ok) {
    return base;
  }

  const { options, optionsBg, correctIndex } = base.value;
  if (options && optionsBg && options.length !== optionsBg.length) {
    return { ok: false, error: "invalid_options_mismatch" };
  }

  const optionCount = options?.length ?? optionsBg?.length;
  if (correctIndex !== undefined && optionCount !== undefined && correctIndex >= optionCount) {
    return { ok: false, error: "invalid_correctIndex" };
  }

  return base;
}

export const validateQuizUpdate = validateKnowledgeCheckUpdate;
