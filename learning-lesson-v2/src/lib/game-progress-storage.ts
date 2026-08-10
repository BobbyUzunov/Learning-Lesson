export type GameProgress = {
  completedLessonIds: string[];
  currentStreak: number;
  lastCompletedAt: string | null;
};

export const gameProgressStorageKey = "learning-lesson-v2-game-progress";
export const guestContinueKey = "learning-lesson-v2-guest-continue";

function emptyProgress(): GameProgress {
  return { completedLessonIds: [], currentStreak: 0, lastCompletedAt: null };
}

function normalizeProgress(value: unknown): GameProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyProgress();
  }

  const candidate = value as Record<string, unknown>;
  const completedLessonIds = Array.isArray(candidate.completedLessonIds)
    ? [
        ...new Set(
          candidate.completedLessonIds
            .filter((id): id is string => typeof id === "string")
            .map((id) => id.trim())
            .filter((id) => id.length > 0 && id.length <= 100)
        )
      ].slice(0, 100)
    : [];
  const currentStreak =
    Number.isSafeInteger(candidate.currentStreak) && (candidate.currentStreak as number) >= 0
      ? (candidate.currentStreak as number)
      : 0;
  const lastCompletedAt =
    typeof candidate.lastCompletedAt === "string" &&
    Number.isFinite(Date.parse(candidate.lastCompletedAt))
      ? candidate.lastCompletedAt
      : null;

  return { completedLessonIds, currentStreak, lastCompletedAt };
}

export function getStoredProgress(): GameProgress {
  if (typeof window === "undefined") {
    return emptyProgress();
  }

  const raw = window.localStorage.getItem(gameProgressStorageKey);
  if (!raw) {
    return emptyProgress();
  }

  try {
    return normalizeProgress(JSON.parse(raw) as unknown);
  } catch {
    return emptyProgress();
  }
}

function saveStoredProgress(progress: GameProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(gameProgressStorageKey, JSON.stringify(progress));
}

export function completeStoredLesson(lessonId: string) {
  const progress = getStoredProgress();
  const completedLessonIds = progress.completedLessonIds.includes(lessonId)
    ? progress.completedLessonIds
    : [...progress.completedLessonIds, lessonId];

  const nextProgress = {
    completedLessonIds,
    currentStreak: Math.max(1, progress.currentStreak || 0),
    lastCompletedAt: new Date().toISOString()
  };

  saveStoredProgress(nextProgress);
  return nextProgress;
}

export function clearStoredProgress() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(gameProgressStorageKey);
}
