import { describe, expect, it } from "vitest";
import { getDailyChallengeLessonId, getDailyChallengeStatus } from "./daily-challenge";

describe("daily challenge", () => {
  it("returns a stable lesson for the same date", () => {
    const date = new Date("2026-07-02T12:00:00.000Z");
    expect(getDailyChallengeLessonId(date)).toBe(getDailyChallengeLessonId(date));
  });

  it("marks completion only when the challenge lesson was completed today", () => {
    const date = new Date("2026-07-02T12:00:00.000Z");
    const lessonId = getDailyChallengeLessonId(date);

    expect(
      getDailyChallengeStatus(
        [
          {
            lesson_id: lessonId,
            completed: true,
            xp_earned: 100,
            completed_at: "2026-07-02T10:00:00.000Z"
          }
        ],
        date
      ).completed
    ).toBe(true);

    expect(
      getDailyChallengeStatus(
        [
          {
            lesson_id: lessonId,
            completed: true,
            xp_earned: 100,
            completed_at: "2026-07-01T10:00:00.000Z"
          }
        ],
        date
      ).completed
    ).toBe(false);
  });
});
