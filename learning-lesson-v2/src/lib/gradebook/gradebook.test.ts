import { describe, expect, it } from "vitest";
import type { Assessment, AssessmentReportRow } from "@/lib/assessments/types";
import type { AssignmentReportRow, ClassroomAssignment } from "@/lib/assignments/types";
import type { ClassroomReportRow } from "@/lib/classrooms/types";
import { buildClassroomGradebook } from "./build-classroom-gradebook";
import { classroomGradebookToCsv, gradebookCsvFilename } from "./csv";

const labels = {
  missing: "Not submitted",
  draft: "Draft",
  submitted: "Waiting review",
  approved: "Approved",
  needsChanges: "Needs changes"
};

function student(overrides: Partial<ClassroomReportRow> = {}): ClassroomReportRow {
  return {
    studentId: "s1",
    displayName: "Ada",
    email: "ada@school.bg",
    rosterName: "Ada Lovelace",
    completedLessons: 4,
    xp: 400,
    level: 3,
    lastVisit: "2026-08-17",
    joinedAt: "2026-08-01T10:00:00.000Z",
    ...overrides
  };
}

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
    dueAt: null,
    durationMinutes: 20,
    createdAt: "2026-08-16T09:00:00.000Z",
    questionCount: 5,
    ...overrides
  };
}

describe("buildClassroomGradebook", () => {
  it("builds a student matrix without using emails", () => {
    const assignmentRows: AssignmentReportRow[] = [
      {
        studentId: "s1",
        displayName: "Ada",
        submissionId: "sub-1",
        status: "approved",
        deliverableText: "done",
        deliverableUrl: null,
        teacherNote: null,
        submittedAt: "2026-08-12T10:00:00.000Z",
        reviewedAt: "2026-08-13T10:00:00.000Z",
        joinedAt: "2026-08-01T10:00:00.000Z"
      }
    ];
    const assessmentRows: AssessmentReportRow[] = [
      {
        studentId: "s1",
        displayName: "Ada",
        attemptId: "att-1",
        status: "submitted",
        score: 8,
        maxScore: 10,
        percentage: 80,
        submittedAt: "2026-08-17T08:00:00.000Z",
        joinedAt: "2026-08-01T10:00:00.000Z"
      }
    ];

    const gradebook = buildClassroomGradebook({
      classroomId: "c1",
      language: "en",
      labels,
      students: [student(), student({ studentId: "s2", displayName: "Bob", rosterName: null, email: "bob@school.bg" })],
      assignments: [assignment()],
      assessments: [assessment()],
      assignmentReports: { a1: assignmentRows },
      assessmentReports: { "check-1": assessmentRows }
    });

    expect(gradebook.columns.map((column) => column.label)).toEqual(["School poster", "HTML check"]);
    expect(gradebook.rows.map((row) => row.name)).toEqual(["Ada Lovelace", "Bob"]);
    expect(JSON.stringify(gradebook)).not.toContain("@school.bg");
    expect(gradebook.rows[0]?.cells["assignment:a1"]).toEqual({ label: "Approved", tone: "ok" });
    expect(gradebook.rows[0]?.cells["assessment:check-1"]).toEqual({ label: "80%", tone: "ok" });
    expect(gradebook.rows[1]?.cells["assignment:a1"]?.tone).toBe("missing");
  });

  it("uses Bulgarian mission titles", () => {
    const gradebook = buildClassroomGradebook({
      classroomId: "c1",
      language: "bg",
      labels,
      students: [student()],
      assignments: [assignment()],
      assessments: [],
      assignmentReports: { a1: [] },
      assessmentReports: {}
    });

    expect(gradebook.columns[0]?.label).toBe("Училищен плакат");
  });
});

describe("classroomGradebookToCsv", () => {
  it("escapes commas and prefixes a UTF-8 BOM", () => {
    const csv = classroomGradebookToCsv({
      studentHeader: "Student",
      xpHeader: "XP",
      lessonsHeader: "Lessons",
      gradebook: {
        columns: [{ id: "assignment:a1", kind: "assignment", label: "Poster, v2", href: "/a" }],
        rows: [
          {
            studentId: "s1",
            name: "Ada Lovelace",
            xp: 400,
            completedLessons: 4,
            cells: { "assignment:a1": { label: "Approved", tone: "ok" } }
          }
        ]
      }
    });

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Poster, v2"');
    expect(csv).toContain("Ada Lovelace,Approved,400,4");
  });

  it("builds a safe filename from the class name", () => {
    expect(gradebookCsvFilename("8A Software / Пилот")).toBe("gradebook-8A-Software-Пилот.csv");
  });
});
