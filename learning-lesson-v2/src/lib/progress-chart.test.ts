import { describe, expect, it } from "vitest";
import { buildWeeklyProgressSeries, getMaxChartValue } from "./progress-chart";

describe("progress chart", () => {
  it("groups completed lessons into weekly XP buckets", () => {
    const points = buildWeeklyProgressSeries(
      [
        {
          lesson_id: "1",
          completed: true,
          xp_earned: 100,
          completed_at: new Date().toISOString()
        }
      ],
      4
    );

    expect(points).toHaveLength(4);
    expect(points.some((point) => point.xp === 100)).toBe(true);
    expect(getMaxChartValue(points)).toBeGreaterThanOrEqual(100);
  });
});
