import { describe, expect, it } from "vitest";
import {
  mapClassroomReportRow,
  mapClassroomRow,
  shortStudentId,
  summarizeClassroomReport,
  type ClassroomReportRow,
  type ClassroomReportRpcRow,
  type ClassroomRow
} from "./types";

const baseRow: ClassroomRow = {
  id: "class-1",
  teacher_id: "teacher-1",
  name: "8A Software",
  description: "Pilot class",
  specialty_id: "software-development",
  grade_level: 8,
  academic_year: "2026/2027",
  status: "active",
  join_code: "A1B2C3",
  join_code_enabled: true,
  created_at: "2026-07-24T10:00:00Z"
};

describe("classroom mappers", () => {
  it("maps a classroom row to camelCase with member count", () => {
    const classroom = mapClassroomRow(baseRow, 12);
    expect(classroom).toMatchObject({
      id: "class-1",
      teacherId: "teacher-1",
      name: "8A Software",
      specialtyId: "software-development",
      gradeLevel: 8,
      academicYear: "2026/2027",
      status: "active",
      joinCode: "A1B2C3",
      joinCodeEnabled: true,
      memberCount: 12
    });
  });

  it("maps a report RPC row without email", () => {
    const rpcRow: ClassroomReportRpcRow = {
      student_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      display_name: "Ivan",
      completed_lessons: 5,
      xp: 500,
      level: 4,
      last_visit: "2026-07-24",
      joined_at: "2026-07-20T09:00:00Z"
    };
    expect(mapClassroomReportRow(rpcRow)).toEqual({
      studentId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      displayName: "Ivan",
      completedLessons: 5,
      xp: 500,
      level: 4,
      lastVisit: "2026-07-24",
      joinedAt: "2026-07-20T09:00:00Z"
    });
    expect(shortStudentId(rpcRow.student_id)).toBe("AAAAAAAA");
  });
});

describe("summarizeClassroomReport", () => {
  const today = "2026-07-24";
  const rows: ClassroomReportRow[] = [
    {
      studentId: "a",
      displayName: "A",
      completedLessons: 4,
      xp: 400,
      level: 3,
      lastVisit: "2026-07-24",
      joinedAt: "2026-07-20T09:00:00Z"
    },
    {
      studentId: "b",
      displayName: "B",
      completedLessons: 2,
      xp: 200,
      level: 2,
      lastVisit: "2026-07-22",
      joinedAt: "2026-07-21T09:00:00Z"
    }
  ];

  it("returns zeroed summary for an empty class", () => {
    expect(summarizeClassroomReport([], today)).toEqual({
      studentCount: 0,
      averageCompletedLessons: 0,
      averageXp: 0,
      activeToday: 0
    });
  });

  it("computes averages and active-today count", () => {
    expect(summarizeClassroomReport(rows, today)).toEqual({
      studentCount: 2,
      averageCompletedLessons: 3,
      averageXp: 300,
      activeToday: 1
    });
  });
});
