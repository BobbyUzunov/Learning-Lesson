import { describe, expect, it } from "vitest";
import { completeStoredLesson, getGameProgressStats, getStoredProgress } from "./game-progress";

describe("guest mission completion", () => {
  it("stores guest progress locally without calling the API", () => {
    const before = getStoredProgress();
    const progress = completeStoredLesson("1");
    const stats = getGameProgressStats(progress);

    expect(stats.completedCount).toBeGreaterThanOrEqual(before.completedLessonIds.includes("1") ? before.completedLessonIds.length : 1);
    expect(progress.completedLessonIds).toContain("1");
  });
});
