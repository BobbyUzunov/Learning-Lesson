import { describe, expect, it } from "vitest";
import { getEarnedCertificates, getQuestCertificates } from "./certificates";
import { gameQuests } from "./game-data";
import { fallbackCourseProjects } from "./projects/fallback-data";
import type { ProjectSubmissionRecord } from "./projects/types";

function submission(projectId: string, status: ProjectSubmissionRecord["status"]): ProjectSubmissionRecord {
  return {
    project_id: projectId,
    repo_url: "https://github.com/example/repo",
    deploy_url: "https://example.vercel.app",
    notes: "Detailed notes",
    submitted_at: "2026-07-03T10:00:00.000Z",
    status,
    review_notes: null,
    reviewed_at: null
  };
}

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

  it("requires approved capstone for ai-product-builder certificate", () => {
    const quest = gameQuests.find((item) => item.id === "ai-product-builder");
    expect(quest).toBeTruthy();

    const progress = {
      completedLessonIds: quest!.lessonIds,
      currentStreak: 1,
      lastCompletedAt: "2026-07-02T10:00:00.000Z"
    };

    const withoutProjects = getEarnedCertificates(progress, "en", [], [], gameQuests, fallbackCourseProjects);
    expect(withoutProjects.some((certificate) => certificate.questId === "ai-product-builder")).toBe(false);

    const withDeployOnly = getEarnedCertificates(
      progress,
      "en",
      [],
      [submission("aipb-live-deploy", "submitted")],
      gameQuests,
      fallbackCourseProjects
    );
    expect(withDeployOnly.some((certificate) => certificate.questId === "ai-product-builder")).toBe(false);

    const withApprovedCapstone = getEarnedCertificates(
      progress,
      "en",
      [],
      [submission("aipb-live-deploy", "submitted"), submission("aipb-capstone", "approved")],
      gameQuests,
      fallbackCourseProjects
    );
    expect(withApprovedCapstone.some((certificate) => certificate.questId === "ai-product-builder")).toBe(true);
  });
});

describe("mission coverage", () => {
  it("ships 63 playable lessons aligned with planned quest totals", () => {
    expect(gameQuests.reduce((sum, quest) => sum + quest.lessonIds.length, 0)).toBe(63);
  });
});
