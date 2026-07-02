import { describe, expect, it } from "vitest";
import { getGameProgressStats } from "./game-progress";

describe("game-progress stats", () => {
  it("calculates XP from completed lessons", () => {
    const stats = getGameProgressStats({
      completedLessonIds: ["1", "2"],
      currentStreak: 0,
      lastCompletedAt: null
    });

    expect(stats.completedCount).toBe(2);
    expect(stats.xp).toBe(200);
    expect(stats.level).toBeGreaterThanOrEqual(1);
  });

  it("picks the first incomplete mission as current mission", () => {
    const stats = getGameProgressStats({
      completedLessonIds: ["1"],
      currentStreak: 1,
      lastCompletedAt: null
    });

    expect(stats.currentMission.id).toBe("2");
    expect(stats.currentQuest.id).toBe("frontend");
  });
});
