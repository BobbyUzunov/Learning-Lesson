export type LessonMissionDraft = {
  solution: string;
  hintsUsed: number;
};

export type ProjectSubmissionDraft = {
  notes: string;
  repoUrl: string;
  deployUrl: string;
};

export type AssignmentSubmissionDraft = {
  text: string;
  url: string;
};

export type AssessmentAnswersDraft = {
  answers: Record<string, number>;
};

const LESSON_DRAFT_PREFIX = "learning-lesson-v2-lesson-draft:";
const PROJECT_DRAFT_PREFIX = "learning-lesson-v2-project-draft:";
const ASSIGNMENT_DRAFT_PREFIX = "learning-lesson-v2-assignment-draft:";
const ASSESSMENT_DRAFT_PREFIX = "learning-lesson-v2-assessment-draft:";

export function lessonDraftKey(lessonId: string) {
  return `${LESSON_DRAFT_PREFIX}${lessonId}`;
}

export function projectDraftKey(projectId: string) {
  return `${PROJECT_DRAFT_PREFIX}${projectId}`;
}

export function assignmentDraftKey(assignmentId: string) {
  return `${ASSIGNMENT_DRAFT_PREFIX}${assignmentId}`;
}

export function assessmentDraftKey(assessmentId: string) {
  return `${ASSESSMENT_DRAFT_PREFIX}${assessmentId}`;
}

export function mergeAssignmentSubmissionDraft(
  server: AssignmentSubmissionDraft,
  restored: AssignmentSubmissionDraft
): AssignmentSubmissionDraft {
  return {
    text: server.text.trim() ? server.text : restored.text,
    url: server.url.trim() ? server.url : restored.url
  };
}

export function readJsonDraft<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJsonDraft<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearJsonDraft(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}
