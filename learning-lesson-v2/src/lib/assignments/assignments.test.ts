import { describe, expect, it } from "vitest";
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
      email: "ada@school.bg",
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
  });

  it("summarizes assignment report statuses", () => {
    const rows: AssignmentReportRow[] = [
      {
        studentId: "1",
        displayName: "A",
        email: null,
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
        email: null,
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
        email: null,
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
        email: null,
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
        email: null,
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
