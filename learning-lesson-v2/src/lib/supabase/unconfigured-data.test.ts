import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAssessmentQuestionAnalysis,
  getAssessmentReport,
  getClassroomAssessments,
  getMyAssessmentAttempt,
  getMyAssessmentReview,
  getStudentAssessmentById,
  getTeacherAssessmentById,
  getTeacherAssessments
} from "./assessments";
import {
  getAssignmentById,
  getAssignmentReport,
  getClassroomAssignments,
  getMySubmissionForAssignment,
  getPendingTeacherReviews
} from "./assignments";
import {
  getClassroomById,
  getClassroomLabProgress,
  getClassroomReport,
  getTeacherClassrooms,
  listClassroomTeachers,
  listCoTeacherCandidates,
  listTransferCandidates
} from "./classrooms";
import { getClassroomGradebook } from "./gradebook";
import { getMyClassroomIds } from "./memberships";
import {
  getAdminSubmissionById,
  getCurrentUserProjectSubmissions,
  getPendingReviewSubmissions
} from "./project-submissions";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentSession: vi.fn()
}));

vi.mock("./auth", () => ({
  getCurrentSession: (...args: unknown[]) => mocks.getCurrentSession(...args)
}));

vi.mock("./server", () => ({
  createClient: (...args: unknown[]) => mocks.createClient(...args)
}));

describe("Supabase data fallbacks without usable public credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "example-anon-key");
    mocks.getCurrentSession.mockResolvedValue({
      user: { id: "e2e-user" },
      isAdmin: false
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ["teacher classrooms", () => getTeacherClassrooms(), []],
    ["classroom detail", () => getClassroomById("class-1"), null],
    ["classroom report", () => getClassroomReport("class-1"), []],
    ["classroom lab progress", () => getClassroomLabProgress("class-1"), []],
    ["classroom transfer candidates", () => listTransferCandidates("class-1"), []],
    ["classroom teachers", () => listClassroomTeachers("class-1"), []],
    ["classroom co-teacher candidates", () => listCoTeacherCandidates("class-1"), []],
    ["classroom assignments", () => getClassroomAssignments("class-1"), []],
    ["assignment detail", () => getAssignmentById("assignment-1"), null],
    ["assignment report", () => getAssignmentReport("assignment-1"), []],
    ["student assignment submission", () => getMySubmissionForAssignment("assignment-1"), null],
    ["teacher assessments", () => getTeacherAssessments(), []],
    ["classroom assessments", () => getClassroomAssessments("class-1"), []],
    ["teacher assessment detail", () => getTeacherAssessmentById("assessment-1"), null],
    ["student assessment detail", () => getStudentAssessmentById("assessment-1"), null],
    ["student assessment attempt", () => getMyAssessmentAttempt("assessment-1"), null],
    ["student assessment review", () => getMyAssessmentReview("assessment-1"), []],
    ["assessment report", () => getAssessmentReport("assessment-1"), []],
    ["assessment analysis", () => getAssessmentQuestionAnalysis("assessment-1"), []],
    ["teacher pending reviews", () => getPendingTeacherReviews(), []],
    ["student classroom memberships", () => getMyClassroomIds(), []],
    ["student project submissions", () => getCurrentUserProjectSubmissions(), []],
    ["admin pending project reviews", () => getPendingReviewSubmissions(), []],
    ["admin project submission detail", () => getAdminSubmissionById("submission-1"), null]
  ] as const)("returns an empty %s result without creating a client", async (_label, loadData, expected) => {
    await expect(loadData()).resolves.toEqual(expected);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("returns an empty classroom gradebook without creating a client", async () => {
    await expect(getClassroomGradebook("class-1", "bg")).resolves.toEqual({ columns: [], rows: [] });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
