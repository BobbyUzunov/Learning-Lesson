import type { Lesson, ProgressRecord } from "./types";

export function getTotalXp(progress: ProgressRecord[]) {
  return progress.reduce((sum, item) => sum + (item.completed ? item.xp_earned : 0), 0);
}

export function getLevelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}

export function isLessonUnlocked(lesson: Lesson, completedLessonIds: Set<string>) {
  return !lesson.lockedBy || completedLessonIds.has(lesson.lockedBy);
}
