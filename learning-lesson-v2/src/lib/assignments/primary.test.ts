import { describe, expect, it } from "vitest";
import { pickPrimaryAssignment } from "./primary";
import type { AssignmentStatus } from "./types";

const now = new Date("2026-10-03T10:00:00.000Z");

function assignment(id: string, submissionStatus: AssignmentStatus | null, dueAt: string | null = null) {
  return { id, submissionStatus, dueAt };
}

describe("pickPrimaryAssignment", () => {
  it("prefers missing work over an earlier submitted assignment", () => {
    const result = pickPrimaryAssignment([assignment("A", "submitted"), assignment("B", "missing")], now);
    expect(result?.id).toBe("B");
  });

  it("prefers draft work over submitted", () => {
    const result = pickPrimaryAssignment([assignment("A", "submitted"), assignment("B", "draft")], now);
    expect(result?.id).toBe("B");
  });

  it("treats a null status as missing", () => {
    const result = pickPrimaryAssignment([assignment("A", "submitted"), assignment("B", null)], now);
    expect(result?.id).toBe("B");
  });

  it("lets needs_changes win over open and submitted work", () => {
    const result = pickPrimaryAssignment(
      [
        assignment("A", "missing", "2026-10-01T00:00:00.000Z"),
        assignment("B", "submitted"),
        assignment("C", "needs_changes")
      ],
      now
    );
    expect(result?.id).toBe("C");
  });

  it("prefers overdue open work, then the earliest due date", () => {
    const result = pickPrimaryAssignment(
      [
        assignment("A", "missing"),
        assignment("B", "missing", "2026-10-10T00:00:00.000Z"),
        assignment("C", "draft", "2026-10-05T00:00:00.000Z"),
        assignment("D", "missing", "2026-10-02T00:00:00.000Z")
      ],
      now
    );
    expect(result?.id).toBe("D");

    const noOverdue = pickPrimaryAssignment(
      [assignment("A", "missing"), assignment("B", "missing", "2026-10-10T00:00:00.000Z"), assignment("C", "draft", "2026-10-05T00:00:00.000Z")],
      now
    );
    expect(noOverdue?.id).toBe("C");
  });

  it("keeps list order for equally ranked open work", () => {
    const result = pickPrimaryAssignment([assignment("A", "missing"), assignment("B", "draft")], now);
    expect(result?.id).toBe("A");
  });

  it("falls back to submitted when nothing else is actionable", () => {
    const result = pickPrimaryAssignment([assignment("A", "approved"), assignment("B", "submitted")], now);
    expect(result?.id).toBe("B");
  });

  it("returns null when everything is approved or the list is empty", () => {
    expect(pickPrimaryAssignment([assignment("A", "approved")], now)).toBeNull();
    expect(pickPrimaryAssignment([], now)).toBeNull();
  });
});
