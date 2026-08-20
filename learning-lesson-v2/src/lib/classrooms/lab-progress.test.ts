import { describe, expect, it } from "vitest";
import type { GameQuest } from "@/lib/game-data";
import type { ClassroomReportRow } from "./types";
import {
  buildClassroomLabProgress,
  classroomLabProgressToCsv,
  labProgressCsvFilename
} from "./lab-progress";

const frontend: GameQuest = {
  id: "frontend",
  title: "Frontend Course",
  titleBg: "Frontend курс",
  description: "UI",
  levels: 2,
  difficulty: "Beginner",
  estimatedTime: "1h",
  rewardBadge: "UI",
  xpReward: 200,
  lessonIds: ["1", "2"]
};

const backend: GameQuest = {
  id: "backend",
  title: "Backend Course",
  titleBg: "Backend курс",
  description: "API",
  levels: 2,
  difficulty: "Beginner",
  estimatedTime: "1h",
  rewardBadge: "API",
  xpReward: 200,
  lessonIds: ["3", "4"]
};

const ada: ClassroomReportRow = {
  studentId: "ada",
  displayName: "Ada",
  email: "ada@school.bg",
  rosterName: "Ада Ловлейс",
  completedLessons: 3,
  xp: 300,
  level: 2,
  lastVisit: "2026-08-20",
  joinedAt: "2026-08-01T09:00:00Z"
};

const bob: ClassroomReportRow = {
  studentId: "bob",
  displayName: "Bob",
  email: "bob@school.bg",
  rosterName: null,
  completedLessons: 0,
  xp: 0,
  level: 1,
  lastVisit: null,
  joinedAt: "2026-08-02T09:00:00Z"
};

describe("classroom lab progress", () => {
  it("builds per-course lesson counts and a strongest-course snapshot", () => {
    const progress = buildClassroomLabProgress({
      students: [ada, bob],
      courses: [frontend, backend],
      completions: [
        { studentId: "ada", lessonId: "1", xpEarned: 100, completedAt: "2026-08-18T10:00:00.000Z" },
        { studentId: "ada", lessonId: "2", xpEarned: 100, completedAt: "2026-08-19T10:00:00.000Z" },
        { studentId: "ada", lessonId: "3", xpEarned: 100, completedAt: "2026-08-20T08:00:00.000Z" }
      ],
      language: "bg"
    });

    expect(progress.courses.map((course) => course.title)).toEqual(["Frontend курс", "Backend курс"]);
    expect(progress.rows[0]).toMatchObject({
      name: "Ада Ловлейс",
      lastLabAt: "2026-08-20T08:00:00.000Z",
      strongest: { courseId: "frontend", title: "Frontend курс", percent: 100 }
    });
    expect(progress.rows[0]?.cells.frontend).toEqual({
      completed: 2,
      total: 2,
      percent: 100,
      status: "complete"
    });
    expect(progress.rows[0]?.cells.backend).toEqual({
      completed: 1,
      total: 2,
      percent: 50,
      status: "started"
    });
    expect(progress.rows[1]?.strongest).toBeNull();
    expect(progress.rows[1]?.cells.frontend.status).toBe("not_started");
    expect(progress.summary).toEqual({
      studentCount: 2,
      startedCount: 1,
      completedCourseCount: 1,
      averageStrongestPercent: 100
    });
  });

  it("exports a CSV without student emails", () => {
    const progress = buildClassroomLabProgress({
      students: [ada, bob],
      courses: [frontend],
      completions: [
        { studentId: "ada", lessonId: "1", xpEarned: 100, completedAt: "2026-08-18T10:00:00.000Z" }
      ],
      language: "en"
    });
    const csv = classroomLabProgressToCsv({
      progress,
      studentHeader: "Student",
      strongestHeader: "Furthest course",
      lastActivityHeader: "Last lab lesson",
      completeLabel: "Complete",
      notStartedLabel: "—"
    });

    expect(csv).toContain("Ада Ловлейс");
    expect(csv).not.toContain("@school.bg");
    expect(csv).toContain("Frontend Course 50%");
    expect(labProgressCsvFilename("8A Software / Пилот")).toBe("labs-8A-Software-Пилот.csv");
  });
});
