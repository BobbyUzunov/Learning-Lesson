import { describe, expect, it } from "vitest";
import type { AssignmentStatus, ClassroomAssignment } from "@/lib/assignments/types";
import { resolveMissionAssignmentState } from "./mission-state";

function assignment(
  id: string,
  missionId: string,
  status: AssignmentStatus
): ClassroomAssignment {
  return {
    id,
    classroomId: `class-${id}`,
    missionId,
    assignedBy: "teacher",
    titleOverride: null,
    instructions: null,
    dueAt: null,
    createdAt: `2026-08-0${id.length}T10:00:00.000Z`,
    submissionStatus: status
  };
}

describe("curriculum mission assignment state", () => {
  it("treats only teacher approval as verified completion", () => {
    expect(resolveMissionAssignmentState([assignment("one", "mission-a", "submitted")], "mission-a")).toMatchObject({
      status: "submitted",
      verified: false
    });
    expect(resolveMissionAssignmentState([assignment("two", "mission-a", "approved")], "mission-a")).toMatchObject({
      status: "approved",
      verified: true
    });
  });

  it("prioritizes work that needs action over an older approved assignment", () => {
    const state = resolveMissionAssignmentState(
      [assignment("approved", "mission-a", "approved"), assignment("changes", "mission-a", "needs_changes")],
      "mission-a"
    );

    expect(state).toMatchObject({ assignmentId: "changes", status: "needs_changes", verified: false });
  });

  it("ignores assignments for other missions", () => {
    expect(resolveMissionAssignmentState([assignment("one", "mission-b", "approved")], "mission-a")).toBeNull();
  });
});
