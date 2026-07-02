import { gameLessons } from "./game-data";
import type { ProgressRecord } from "./types";

const epoch = Date.UTC(2026, 0, 1);

export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getDailyChallengeLessonId(date = new Date()) {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayIndex = Math.floor((utc - epoch) / 86_400_000);
  const index = ((dayIndex % gameLessons.length) + gameLessons.length) % gameLessons.length;
  return gameLessons[index]?.id ?? gameLessons[0].id;
}

export function isChallengeCompletedOnDate(
  lessonId: string,
  completedAt: string | null | undefined,
  date = new Date()
) {
  if (!completedAt) {
    return false;
  }

  return lessonId === getDailyChallengeLessonId(date) && completedAt.slice(0, 10) === getDateKey(date);
}

export function getDailyChallengeStatus(
  progress: ProgressRecord[] = [],
  date = new Date()
): { dateKey: string; lessonId: string; completed: boolean } {
  const lessonId = getDailyChallengeLessonId(date);
  const dateKey = getDateKey(date);
  const record = progress.find((item) => item.lesson_id === lessonId && item.completed);

  return {
    dateKey,
    lessonId,
    completed: Boolean(record && record.completed_at?.slice(0, 10) === dateKey)
  };
}
