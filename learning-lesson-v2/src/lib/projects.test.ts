import { describe, expect, it } from "vitest";
import { gameQuests } from "./game-data";
import { fallbackCourseProjects } from "./projects/fallback-data";
import { courseCertificateRequirementsMet, getProjectById, validateProjectSubmissionInput } from "./projects/helpers";
import {
  canLearnerEditSubmission,
  isProjectCompleteForDisplay,
  isProjectRequirementMet,
  isSubmissionPendingReview
} from "./projects/submissions";
import type { ProjectSubmissionRecord } from "./projects/types";

function submission(
  projectId: string,
  status: ProjectSubmissionRecord["status"],
  submittedAt = "2026-07-03T10:00:00.000Z"
): ProjectSubmissionRecord {
  return {
    project_id: projectId,
    repo_url: "https://github.com/example/repo",
    deploy_url: "https://example.vercel.app",
    notes: "Detailed project summary with enough characters for validation.",
    submitted_at: submittedAt,
    status,
    review_notes: null,
    reviewed_at: null
  };
}

describe("projects", () => {
  it("unlocks product brief after lesson 7", () => {
    const project = getProjectById(fallbackCourseProjects, "aipb-product-brief");
    expect(project).toBeTruthy();
  });

  it("requires live deploy submission and approved capstone for ai-product-builder certificate", () => {
    const quest = gameQuests.find((item) => item.id === "ai-product-builder");
    expect(quest).toBeTruthy();

    const lessonsComplete = quest!.lessonIds;
    const deployOnly = [submission("aipb-live-deploy", "submitted")];
    const withPendingCapstone = [
      submission("aipb-live-deploy", "submitted"),
      submission("aipb-capstone", "submitted")
    ];
    const withApprovedCapstone = [
      submission("aipb-live-deploy", "submitted"),
      submission("aipb-capstone", "approved")
    ];

    expect(courseCertificateRequirementsMet(fallbackCourseProjects, "ai-product-builder", lessonsComplete, [])).toBe(false);
    expect(courseCertificateRequirementsMet(fallbackCourseProjects, "ai-product-builder", lessonsComplete, deployOnly)).toBe(
      false
    );
    expect(
      courseCertificateRequirementsMet(fallbackCourseProjects, "ai-product-builder", lessonsComplete, withPendingCapstone)
    ).toBe(false);
    expect(
      courseCertificateRequirementsMet(fallbackCourseProjects, "ai-product-builder", lessonsComplete, withApprovedCapstone)
    ).toBe(true);
  });

  it("validates deploy submission fields", () => {
    const project = getProjectById(fallbackCourseProjects, "aipb-live-deploy");
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
        notes: "x".repeat(10001),
        repoUrl: "https://github.com/example/learning-lesson",
        deployUrl: "https://learning-lesson-v2.vercel.app"
      })
    ).toEqual({ ok: false, error: "brief_too_long" });
  });
});

describe("project submissions", () => {
  it("treats capstone as complete only when approved", () => {
    const capstone = getProjectById(fallbackCourseProjects, "aipb-capstone")!;
    const submitted = submission("aipb-capstone", "submitted");
    const approved = submission("aipb-capstone", "approved");

    expect(isProjectRequirementMet(capstone, submitted)).toBe(false);
    expect(isProjectRequirementMet(capstone, approved)).toBe(true);
    expect(isProjectCompleteForDisplay(capstone, submitted)).toBe(false);
    expect(isProjectCompleteForDisplay(capstone, approved)).toBe(true);
    expect(isSubmissionPendingReview(capstone, submitted)).toBe(true);
  });

  it("locks capstone resubmit while pending review", () => {
    const capstone = getProjectById(fallbackCourseProjects, "aipb-capstone")!;
    const submitted = submission("aipb-capstone", "submitted");
    const needsChanges = submission("aipb-capstone", "needs_changes");

    expect(canLearnerEditSubmission(capstone, submitted)).toBe(false);
    expect(canLearnerEditSubmission(capstone, needsChanges)).toBe(true);
  });
});
