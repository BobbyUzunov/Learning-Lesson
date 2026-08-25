export const CUSTOM_TITLE_MIN = 3;
export const CUSTOM_TITLE_MAX = 200;
export const CUSTOM_QUESTION_MIN = 1;
export const CUSTOM_QUESTION_MAX = 8;
export const CUSTOM_QUESTION_LENGTH_MIN = 3;
export const CUSTOM_QUESTION_LENGTH_MAX = 400;

export function parseCustomTitle(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const title = value.trim();
  if (title.length < CUSTOM_TITLE_MIN || title.length > CUSTOM_TITLE_MAX) {
    return null;
  }

  return title;
}

export function parseCustomQuestions(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length < CUSTOM_QUESTION_MIN || value.length > CUSTOM_QUESTION_MAX) {
    return null;
  }

  const questions: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      return null;
    }

    const question = item.trim();
    if (question.length < CUSTOM_QUESTION_LENGTH_MIN || question.length > CUSTOM_QUESTION_LENGTH_MAX) {
      return null;
    }

    questions.push(question);
  }

  return questions;
}

export function mapStoredCustomQuestions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "string") {
      return [];
    }

    const question = item.trim();
    return question ? [question] : [];
  });
}
