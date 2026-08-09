import type {
  KnowledgeCheckAnswer,
  KnowledgeCheckAttempt,
  KnowledgeCheckQuestion
} from "./types";

export type KnowledgeCheckGradeResultItem = {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  explanationBg: string;
};

export type KnowledgeCheckGradeResult = KnowledgeCheckAttempt & {
  results: KnowledgeCheckGradeResultItem[];
};

export function parseKnowledgeCheckAnswers(value: unknown): KnowledgeCheckAnswer[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) {
    return null;
  }

  const answers: KnowledgeCheckAnswer[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }

    const { questionId, selectedIndex } = item as Record<string, unknown>;
    if (
      typeof questionId !== "string" ||
      questionId.length < 1 ||
      questionId.length > 100 ||
      !Number.isInteger(selectedIndex) ||
      (selectedIndex as number) < 0 ||
      (selectedIndex as number) > 20
    ) {
      return null;
    }

    answers.push({ questionId, selectedIndex: selectedIndex as number });
  }

  return new Set(answers.map((answer) => answer.questionId)).size === answers.length ? answers : null;
}

/**
 * Grades answers against a secret question bank (server-only).
 * Pass threshold matches complete_lesson: at least 2/3 correct.
 */
export function gradeKnowledgeCheckAnswers(
  bank: KnowledgeCheckQuestion[],
  answers: KnowledgeCheckAnswer[]
): KnowledgeCheckGradeResult | null {
  if (answers.length < 1) {
    return null;
  }

  const byId = new Map(bank.map((question) => [question.id, question]));
  const results: KnowledgeCheckGradeResultItem[] = [];

  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (
      !question ||
      question.correctIndex === undefined ||
      !Number.isInteger(question.correctIndex) ||
      answer.selectedIndex < 0 ||
      answer.selectedIndex >= question.options.length
    ) {
      return null;
    }

    const isCorrect = answer.selectedIndex === question.correctIndex;
    results.push({
      questionId: question.id,
      selectedIndex: answer.selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation ?? "",
      explanationBg: question.explanationBg ?? ""
    });
  }

  const correct = results.filter((item) => item.isCorrect).length;
  const total = results.length;
  return {
    answers,
    correct,
    total,
    passed: total > 0 && correct * 3 >= total * 2,
    results
  };
}
