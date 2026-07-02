import { describe, expect, it } from "vitest";
import { gameQuests } from "./game-data";
import {
  courseCertificateRequirementsMet,
  getProjectById,
  isProjectUnlocked,
  validateProjectSubmissionInput
} from "./projects";

describe("projects", () => {
  it("unlocks product brief after lesson 7", () => {
    const project = getProjectById("aipb-product-brief");
    expect(project).toBeTruthy();
    expect(isProjectUnlocked(project!, ["7"])).toBe(true);
    expect(isProjectUnlocked(project!, [])).toBe(false);
  });

  it("requires deploy project for ai-product-builder certificate", () => {
    const quest = gameQuests.find((item) => item.id === "ai-product-builder");
    expect(quest).toBeTruthy();

    const lessonsComplete = quest!.lessonIds;
    expect(courseCertificateRequirementsMet("ai-product-builder", lessonsComplete, [])).toBe(false);
    expect(courseCertificateRequirementsMet("ai-product-builder", lessonsComplete, ["aipb-live-deploy"])).toBe(true);
  });

  it("validates deploy submission fields", () => {
    const project = getProjectById("aipb-live-deploy");
    expect(project).toBeTruthy();

    expect(
      validateProjectSubmissionInput(project!, {
        notes: "Deployed learning dashboard with auth and lesson completion flow on Vercel.",
        repoUrl: "https://github.com/example/learning-lesson",
        deployUrl: "https://learning-lesson-v2.vercel.app"
      }).ok
    ).toBe(true);

    expect(
      validateProjectSubmissionInput(project!, {
        notes: "short",
        repoUrl: "https://github.com/example/learning-lesson",
        deployUrl: "https://learning-lesson-v2.vercel.app"
      }).ok
    ).toBe(false);
  });
});
