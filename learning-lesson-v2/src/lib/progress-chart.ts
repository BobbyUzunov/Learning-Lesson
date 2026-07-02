import { xpPerLesson } from "./game-data";
import type { ProgressRecord } from "./types";

export type ProgressChartPoint = {
  label: string;
  xp: number;
  lessons: number;
};

function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatWeekLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function buildWeeklyProgressSeries(progress: ProgressRecord[], weeks = 8): ProgressChartPoint[] {
  const now = new Date();
  const buckets = Array.from({ length: weeks }, (_, index) => {
    const start = getWeekStart(now);
    start.setDate(start.getDate() - (weeks - 1 - index) * 7);
    return {
      start,
      end: new Date(start.getTime() + 7 * 86_400_000),
      label: formatWeekLabel(start),
      xp: 0,
      lessons: 0
    };
  });

  for (const record of progress) {
    if (!record.completed || !record.completed_at) {
      continue;
    }

    const completedAt = new Date(record.completed_at);
    const bucket = buckets.find((item) => completedAt >= item.start && completedAt < item.end);
    if (!bucket) {
      continue;
    }

    bucket.lessons += 1;
    bucket.xp += record.xp_earned || xpPerLesson;
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    xp: bucket.xp,
    lessons: bucket.lessons
  }));
}

export function getMaxChartValue(points: ProgressChartPoint[]) {
  return Math.max(1, ...points.map((point) => point.xp));
}
