import type { AssignmentReportRow, AssignmentStatus } from "./types";

export type AssignmentReviewMode = "none" | "pending" | "approved" | "returned";

const reviewOrder: Record<AssignmentReviewMode, number> = {
  pending: 0,
  returned: 1,
  none: 2,
  approved: 3
};

export function getAssignmentReviewMode(status: AssignmentStatus): AssignmentReviewMode {
  if (status === "submitted") {
    return "pending";
  }
  if (status === "approved") {
    return "approved";
  }
  if (status === "needs_changes") {
    return "returned";
  }
  return "none";
}

export function sortAssignmentReportRows(rows: AssignmentReportRow[]): AssignmentReportRow[] {
  return [...rows].sort((left, right) => {
    const modeDiff =
      reviewOrder[getAssignmentReviewMode(left.status)] - reviewOrder[getAssignmentReviewMode(right.status)];
    if (modeDiff !== 0) {
      return modeDiff;
    }
    return (left.displayName ?? left.studentId).localeCompare(right.displayName ?? right.studentId, "bg");
  });
}
