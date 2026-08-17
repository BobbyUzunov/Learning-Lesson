import { describe, expect, it } from "vitest";
import { getAssignmentReviewMode, sortAssignmentReportRows } from "./review-ui";
import {
  mapAssignmentReportRow,
  mapClassroomAssignmentRow,
  summarizeAssignmentReport,
  type AssignmentReportRow
} from "./types";

describe("assignments helpers", () => {
  it("maps classroom assignment rows", () => {
    const mapped = mapClassroomAssignmentRow(
      {
        id: "a1",
        classroom_id: "c1",
        mission_id: "mission-school-poster",
        assigned_by: "t1",
        title_override: null,
        instructions: "Due Friday",
        due_at: "2026-09-01T12:00:00.000Z",
        created_at: "2026-08-20T12:00:00.000Z"
      },
      { missionTitle: "Poster mission", classroomName: "8A" }
    );

    expect(mapped).toMatchObject({
      id: "a1",
      classroomId: "c1",
      missionId: "mission-school-poster",
      instructions: "Due Friday",
      missionTitle: "Poster mission",
      classroomName: "8A"
    });
  });

  it("maps report rows and treats unknown status as missing", () => {
    const mapped = mapAssignmentReportRow({
      student_id: "s1",
      display_name: "Ada",
      submission_id: null,
      status: "weird",
      deliverable_text: null,
      deliverable_url: null,
      teacher_note: null,
      submitted_at: null,
      reviewed_at: null,
      joined_at: "2026-08-01T10:00:00.000Z"
    });

    expect(mapped.status).toBe("missing");
    expect(mapped.displayName).toBe("Ada");
    expect(mapped).not.toHaveProperty("email");
  });

  it("summarizes assignment report statuses", () => {
    const rows: AssignmentReportRow[] = [
      {
        studentId: "1",
        displayName: "A",
        submissionId: null,
        status: "missing",
        deliverableText: null,
        deliverableUrl: null,
        teacherNote: null,
        submittedAt: null,
        reviewedAt: null,
        joinedAt: "2026-01-01"
      },
      {
        studentId: "2",
        displayName: "B",
        submissionId: "x",
        status: "draft",
        deliverableText: null,
        deliverableUrl: null,
        teacherNote: null,
        submittedAt: null,
        reviewedAt: null,
        joinedAt: "2026-01-01"
      },
      {
        studentId: "3",
        displayName: "C",
        submissionId: "y",
        status: "submitted",
        deliverableText: "done",
        deliverableUrl: null,
        teacherNote: null,
        submittedAt: "2026-01-02",
        reviewedAt: null,
        joinedAt: "2026-01-01"
      },
      {
        studentId: "4",
        displayName: "D",
        submissionId: "z",
        status: "approved",
        deliverableText: "done",
        deliverableUrl: null,
        teacherNote: null,
        submittedAt: "2026-01-02",
        reviewedAt: "2026-01-03",
        joinedAt: "2026-01-01"
      },
      {
        studentId: "5",
        displayName: "E",
        submissionId: "w",
        status: "needs_changes",
        deliverableText: "done",
        deliverableUrl: null,
        teacherNote: "More detail",
        submittedAt: "2026-01-02",
        reviewedAt: "2026-01-03",
        joinedAt: "2026-01-01"
      }
    ];

    expect(summarizeAssignmentReport(rows)).toEqual({
      studentCount: 5,
      missing: 2,
      submitted: 1,
      approved: 1,
      needsChanges: 1
    });
  });

  it("returns zeros for an empty report", () => {
    expect(summarizeAssignmentReport([])).toEqual({
      studentCount: 0,
      missing: 0,
      submitted: 0,
      approved: 0,
      needsChanges: 0
    });
  });
});

describe("assignment review UI mode", () => {
  it("treats submitted work as a first review, not a finished check", () => {
    expect(getAssignmentReviewMode("submitted")).toBe("pending");
  });

  it("hides the first-time approve action after the teacher already approved", () => {
    expect(getAssignmentReviewMode("approved")).toBe("approved");
  });

  it("treats returned work as waiting for a new student version", () => {
    expect(getAssignmentReviewMode("needs_changes")).toBe("returned");
  });

  it("has no review actions when the student has not submitted", () => {
    expect(getAssignmentReviewMode("missing")).toBe("none");
    expect(getAssignmentReviewMode("draft")).toBe("none");
  });

  it("puts waiting reviews before finished ones", () => {
    const sorted = sortAssignmentReportRows([
      reportRow("approved", "Иван"),
      reportRow("missing", "Мария"),
      reportRow("submitted", "Георги")
    ]);

    expect(sorted.map((item) => item.displayName)).toEqual(["Георги", "Мария", "Иван"]);
  });
});

function reportRow(status: AssignmentReportRow["status"], displayName: string): AssignmentReportRow {
  return {
    studentId: displayName,
    displayName,
    submissionId: status === "missing" ? null : displayName,
    status,
    deliverableText: null,
    deliverableUrl: null,
    teacherNote: null,
    submittedAt: null,
    reviewedAt: null,
    joinedAt: "2026-01-01"
  };
}
