export type GameProgress = {
  completedLessonIds: string[];
  currentStreak: number;
  lastCompletedAt: string | null;
};

const storageKey = "learning-lesson-v2-game-progress";
export const guestContinueKey = "learning-lesson-v2-guest-continue";

export function getStoredProgress(): GameProgress {
  if (typeof window === "undefined") {
    return { completedLessonIds: [], currentStreak: 0, lastCompletedAt: null };
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return { completedLessonIds: [], currentStreak: 0, lastCompletedAt: null };
  }

  try {
    return JSON.parse(raw) as GameProgress;
  } catch {
    return { completedLessonIds: [], currentStreak: 0, lastCompletedAt: null };
  }
}

function saveStoredProgress(progress: GameProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(progress));
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

  window.localStorage.removeItem(storageKey);
}
