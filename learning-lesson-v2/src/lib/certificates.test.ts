import { describe, expect, it } from "vitest";
import { getEarnedCertificates, getQuestCertificates } from "./certificates";
import { gameLessons, gameQuests } from "./game-data";

describe("certificates", () => {
  it("issues a certificate when every lesson in a quest is complete", () => {
    const frontendQuest = gameQuests.find((quest) => quest.id === "frontend");
    expect(frontendQuest).toBeTruthy();

    const progress = {
      completedLessonIds: frontendQuest!.lessonIds,
      currentStreak: 1,
      lastCompletedAt: "2026-07-02T10:00:00.000Z"
    };

    const earned = getEarnedCertificates(progress, "en");
    expect(earned.some((certificate) => certificate.questId === "frontend")).toBe(true);
  });

  it("tracks partial quest progress before a certificate is earned", () => {
    const certificates = getQuestCertificates(
      {
        completedLessonIds: ["3", "14"],
        currentStreak: 1,
        lastCompletedAt: null
      },
      "en"
    );

    const backend = certificates.find((certificate) => certificate.questId === "backend");
    expect(backend?.earned).toBe(false);
    expect(backend?.completedCount).toBe(2);
    expect(backend?.totalCount).toBe(10);
  });

  it("requires deploy mini project for ai-product-builder certificate", () => {
    const quest = gameQuests.find((item) => item.id === "ai-product-builder");
    expect(quest).toBeTruthy();

    const progress = {
      completedLessonIds: quest!.lessonIds,
      currentStreak: 1,
      lastCompletedAt: "2026-07-02T10:00:00.000Z"
    };

    const withoutProject = getEarnedCertificates(progress, "en", [], []);
    expect(withoutProject.some((certificate) => certificate.questId === "ai-product-builder")).toBe(false);

    const withProject = getEarnedCertificates(progress, "en", [], ["aipb-live-deploy"]);
    expect(withProject.some((certificate) => certificate.questId === "ai-product-builder")).toBe(true);
  });
});

describe("mission coverage", () => {
  it("ships 63 playable lessons aligned with planned quest totals", () => {
    expect(gameLessons).toHaveLength(63);
    expect(gameQuests.reduce((sum, quest) => sum + quest.lessonIds.length, 0)).toBe(63);
  });
});
