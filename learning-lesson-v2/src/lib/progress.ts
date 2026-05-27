import { lessons } from "./data";
import { getLevelFromXp, getTotalXp } from "./level";
import type { ProgressRecord } from "./types";

export const demoProgress: ProgressRecord[] = [
  {
    lesson_id: "js-variables",
    completed: true,
    xp_earned: 40,
    completed_at: new Date().toISOString()
  }
];

export function buildProgressSummary(progress: ProgressRecord[]) {
  const completedIds = new Set(progress.filter((item) => item.completed).map((item) => item.lesson_id));
  const xp = getTotalXp(progress);
  const completedCount = completedIds.size;
  const totalLessons = lessons.length;

  return {
    completedIds,
    completedCount,
    totalLessons,
    xp,
    level: getLevelFromXp(xp),
    completionPercent: Math.round((completedCount / totalLessons) * 100)
  };
}
