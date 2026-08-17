import { describe, expect, it } from "vitest";
import type { Assessment } from "@/lib/assessments/types";
import type { ClassroomAssignment } from "@/lib/assignments/types";
import { buildStudentInbox } from "./build-student-inbox";

const now = new Date("2026-08-17T12:00:00.000Z");

function assignment(overrides: Partial<ClassroomAssignment> = {}): ClassroomAssignment {
  return {
    id: "a1",
    classroomId: "c1",
    missionId: "mission-1",
    assignedBy: "t1",
    titleOverride: null,
    instructions: null,
    dueAt: null,
    createdAt: "2026-08-10T10:00:00.000Z",
    missionTitle: "School poster",
    missionTitleBg: "Училищен плакат",
    submissionStatus: "missing",
    classroomName: "8A",
    ...overrides
  };
}

function assessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "check-1",
    classroomId: "c1",
    createdBy: "t1",
    title: "HTML check",
    description: null,
    type: "formative",
    status: "published",
    dueAt: "2026-08-18T12:00:00.000Z",
    durationMinutes: 20,
    createdAt: "2026-08-16T09:00:00.000Z",
    classroomName: "8A",
    questionCount: 5,
    attempt: null,
    ...overrides
  };
}

describe("buildStudentInbox", () => {
  it("surfaces needs-changes before other assignment work", () => {
    const items = buildStudentInbox({
      language: "bg",
      now,
      assignments: [
        assignment({ id: "waiting", missionTitleBg: "Нова задача" }),
        assignment({
          id: "fix",
          missionTitleBg: "Поправи плаката",
          submissionStatus: "needs_changes",
          teacherNote: "Добави alt текст."
        })
      ],
      assessments: []
    });

    expect(items[0]).toMatchObject({
      kind: "needs_changes",
      urgency: "now",
      title: "Поправи плаката",
      href: "/assignments/fix",
      note: "Добави alt текст."
    });
    expect(items[1]?.kind).toBe("waiting");
  });

  it("marks missing work overdue or due soon", () => {
    const items = buildStudentInbox({
      language: "en",
      now,
      assignments: [
        assignment({ id: "late", dueAt: "2026-08-16T12:00:00.000Z", missionTitle: "Late poster" }),
        assignment({ id: "soon", dueAt: "2026-08-18T12:00:00.000Z", missionTitle: "Soon poster" })
      ],
      assessments: []
    });

    expect(items.map((item) => item.kind)).toEqual(["overdue", "due_soon"]);
  });

  it("lists open assessments and skips finished or expired ones", () => {
    const items = buildStudentInbox({
      language: "en",
      now,
      assignments: [],
      assessments: [
        assessment({ id: "open" }),
        assessment({
          id: "done",
          attempt: {
            id: "att-1",
            assessmentId: "done",
            studentId: "s1",
            score: 8,
            maxScore: 10,
            percentage: 80,
            submittedAt: "2026-08-17T08:00:00.000Z"
          }
        }),
        assessment({ id: "closed", status: "closed" })
      ]
    });

    expect(items).toEqual([
      expect.objectContaining({
        id: "assessment-open-open",
        kind: "open_assessment",
        href: "/assessments/open",
        title: "HTML check"
      })
    ]);
  });

  it("keeps approved work only when there is teacher feedback", () => {
    const items = buildStudentInbox({
      language: "en",
      now,
      assignments: [
        assignment({ id: "done-quiet", submissionStatus: "approved" }),
        assignment({
          id: "done-note",
          submissionStatus: "approved",
          teacherNote: "Clear structure.",
          missionTitle: "Done poster"
        }),
        assignment({ id: "queued", submissionStatus: "submitted", missionTitle: "Queued poster" })
      ],
      assessments: []
    });

    expect(items.map((item) => item.kind)).toEqual(["submitted", "feedback"]);
    expect(items.find((item) => item.kind === "feedback")?.note).toBe("Clear structure.");
  });

  it("uses Bulgarian mission titles when language is bg", () => {
    const items = buildStudentInbox({
      language: "bg",
      now,
      assignments: [assignment()],
      assessments: []
    });

    expect(items[0]?.title).toBe("Училищен плакат");
  });
});
