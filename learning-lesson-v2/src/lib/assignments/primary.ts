import type { ClassroomAssignment } from "./types";

type PrimaryCandidate = Pick<ClassroomAssignment, "dueAt" | "submissionStatus">;

function dueTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Picks the assignment the student should act on next. Mirrors the inbox ranking:
 * 1. `needs_changes` (teacher is waiting on the student),
 * 2. open work (missing / draft): overdue first, then earliest due date, then list order,
 * 3. `submitted` (waiting for review) only as a fallback when nothing is actionable.
 * Approved work is never returned.
 */
export function pickPrimaryAssignment<T extends PrimaryCandidate>(
  assignments: T[],
  now: Date = new Date()
): T | null {
  const needsChanges = assignments.find((item) => item.submissionStatus === "needs_changes");
  if (needsChanges) {
    return needsChanges;
  }

  const nowMs = now.getTime();
  const open = assignments
    .map((item, index) => ({ item, index, dueMs: dueTime(item.dueAt) }))
    .filter(({ item }) => {
      const status = item.submissionStatus ?? "missing";
      return status === "missing" || status === "draft";
    })
    .sort((a, b) => {
      const aOverdue = a.dueMs !== null && a.dueMs < nowMs;
      const bOverdue = b.dueMs !== null && b.dueMs < nowMs;
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }
      if (a.dueMs !== b.dueMs) {
        if (a.dueMs === null) return 1;
        if (b.dueMs === null) return -1;
        return a.dueMs - b.dueMs;
      }
      return a.index - b.index;
    });

  if (open.length > 0) {
    return open[0].item;
  }

  return assignments.find((item) => item.submissionStatus === "submitted") ?? null;
}
