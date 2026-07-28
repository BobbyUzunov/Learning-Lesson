import { describe, expect, it } from "vitest";
import {
  isAssessmentExpired,
  mapAssessmentAnalysisRow,
  mapAssessmentReportRow,
  mapAssessmentRow,
  summarizeAssessmentReport,
  type AssessmentReportRow
} from "./types";

describe("assessment helpers", () => {
  it("maps an assessment row and normalizes unknown values", () => {
    expect(
      mapAssessmentRow({
        id: "a1",
        classroom_id: "c1",
        created_by: "t1",
        title: "Entry check",
        description: null,
        assessment_type: "unknown",
        status: "unknown",
        due_at: null,
        duration_minutes: 20,
        question_count: 4,
        created_at: "2026-09-01T10:00:00.000Z"
      })
    ).toMatchObject({ type: "formative", status: "published", durationMinutes: 20, questionCount: 4 });
  });

  it("maps reports without exposing email addresses", () => {
    const row = mapAssessmentReportRow({
      student_id: "s1",
      display_name: "Ada",
      attempt_id: "attempt-1",
      status: "submitted",
      score: 8,
      max_score: 10,
      percentage: "80.00",
      submitted_at: "2026-09-01T10:30:00.000Z",
      joined_at: "2026-08-20T08:00:00.000Z"
    });

    expect(row.percentage).toBe(80);
    expect(row).not.toHaveProperty("email");
  });

  it("summarizes participation and scores", () => {
    const rows: AssessmentReportRow[] = [
      {
        studentId: "s1",
        displayName: "Ada",
        attemptId: "one",
        status: "submitted",
        score: 8,
        maxScore: 10,
        percentage: 80,
        submittedAt: "2026-09-01",
        joinedAt: "2026-08-20"
      },
      {
        studentId: "s2",
        displayName: "Lin",
        attemptId: "two",
        status: "submitted",
        score: 10,
        maxScore: 10,
        percentage: 100,
        submittedAt: "2026-09-01",
        joinedAt: "2026-08-20"
      },
      {
        studentId: "s3",
        displayName: "Sam",
        attemptId: null,
        status: "missing",
        score: null,
        maxScore: null,
        percentage: null,
        submittedAt: null,
        joinedAt: "2026-08-20"
      }
    ];

    expect(summarizeAssessmentReport(rows)).toEqual({
      studentCount: 3,
      submittedCount: 2,
      missingCount: 1,
      averagePercentage: 90,
      highestPercentage: 100
    });
  });

  it("maps per-question analysis", () => {
    expect(
      mapAssessmentAnalysisRow({
        question_id: "q1",
        prompt: "Question",
        question_position: 0,
        points: 2,
        answered_count: "5",
        correct_count: "4",
        correct_percentage: "80.00"
      })
    ).toMatchObject({ answeredCount: 5, correctCount: 4, correctPercentage: 80 });
  });

  it("detects closed and overdue checks", () => {
    const now = new Date("2026-09-10T12:00:00.000Z");
    expect(isAssessmentExpired({ status: "closed", dueAt: null }, now)).toBe(true);
    expect(
      isAssessmentExpired({ status: "published", dueAt: "2026-09-09T12:00:00.000Z" }, now)
    ).toBe(true);
    expect(
      isAssessmentExpired({ status: "published", dueAt: "2026-09-11T12:00:00.000Z" }, now)
    ).toBe(false);
  });
});
