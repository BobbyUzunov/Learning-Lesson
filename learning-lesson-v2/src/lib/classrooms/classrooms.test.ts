import { describe, expect, it } from "vitest";
import {
  mapClassroomReportRow,
  mapClassroomRow,
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
  join_code: "A1B2C3",
  archived: false,
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
      joinCode: "A1B2C3",
      archived: false,
      memberCount: 12
    });
  });

  it("maps a report RPC row to camelCase", () => {
    const rpcRow: ClassroomReportRpcRow = {
      student_id: "student-1",
      display_name: "Ivan",
      email: "ivan@example.com",
      completed_lessons: 5,
      xp: 500,
      level: 4,
      last_visit: "2026-07-24",
      joined_at: "2026-07-20T09:00:00Z"
    };
    expect(mapClassroomReportRow(rpcRow)).toEqual({
      studentId: "student-1",
      displayName: "Ivan",
      email: "ivan@example.com",
      completedLessons: 5,
      xp: 500,
      level: 4,
      lastVisit: "2026-07-24",
      joinedAt: "2026-07-20T09:00:00Z"
    });
  });
});

describe("summarizeClassroomReport", () => {
  const today = "2026-07-24";
  const rows: ClassroomReportRow[] = [
    {
      studentId: "a",
      displayName: "A",
      email: null,
      completedLessons: 4,
      xp: 400,
      level: 3,
      lastVisit: "2026-07-24",
      joinedAt: "2026-07-20T09:00:00Z"
    },
    {
      studentId: "b",
      displayName: "B",
      email: null,
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
