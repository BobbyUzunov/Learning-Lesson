import type { CourseProject, ProjectSubmissionRecord, ProjectSubmissionStatus } from "./types";

export function getSubmissionForProject(submissions: ProjectSubmissionRecord[], projectId: string) {
  return submissions.find((item) => item.project_id === projectId);
}

export function isCapstoneProject(project: CourseProject) {
  return project.type === "capstone";
}

export function isProjectRequirementMet(project: CourseProject, submission: ProjectSubmissionRecord | undefined) {
  if (!submission?.submitted_at) {
    return false;
  }

  if (project.type === "capstone") {
    return submission.status === "approved";
  }

  return submission.status === "submitted" || submission.status === "approved";
}

export function isProjectCompleteForDisplay(project: CourseProject, submission: ProjectSubmissionRecord | undefined) {
  if (project.type === "capstone") {
    return submission?.status === "approved";
  }

  return Boolean(submission?.submitted_at);
}

export function isSubmissionPendingReview(project: CourseProject, submission: ProjectSubmissionRecord | undefined) {
  return project.type === "capstone" && submission?.status === "submitted";
}

export function canLearnerEditSubmission(project: CourseProject, submission: ProjectSubmissionRecord | undefined) {
  if (!submission?.submitted_at) {
    return true;
  }

  if (project.type === "capstone") {
    return submission.status === "needs_changes";
  }

  return true;
}

export function submissionStatusOnSubmit(): ProjectSubmissionStatus {
  return "submitted";
}

export function toSubmittedProjectIds(submissions: ProjectSubmissionRecord[]) {
  return submissions.filter((item) => Boolean(item.submitted_at)).map((item) => item.project_id);
}
