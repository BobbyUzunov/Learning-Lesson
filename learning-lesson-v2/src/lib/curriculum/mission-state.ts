import type { AssignmentStatus, ClassroomAssignment } from "@/lib/assignments/types";

export type MissionAssignmentState = {
  assignmentId: string;
  status: AssignmentStatus;
  verified: boolean;
  teacherNote: string | null;
};

const actionPriority: Record<AssignmentStatus, number> = {
  needs_changes: 0,
  submitted: 1,
  missing: 2,
  draft: 2,
  approved: 3
};

export function resolveMissionAssignmentState(
  assignments: ClassroomAssignment[],
  missionId: string
): MissionAssignmentState | null {
  const assignment = assignments
    .filter((entry) => entry.missionId === missionId)
    .sort((left, right) => {
      const leftStatus = left.submissionStatus ?? "missing";
      const rightStatus = right.submissionStatus ?? "missing";
      return (
        actionPriority[leftStatus] - actionPriority[rightStatus] ||
        left.createdAt.localeCompare(right.createdAt)
      );
    })[0];

  if (!assignment) {
    return null;
  }

  const status = assignment.submissionStatus ?? "missing";
  return {
    assignmentId: assignment.id,
    status,
    verified: status === "approved",
    teacherNote: assignment.teacherNote ?? null
  };
}
