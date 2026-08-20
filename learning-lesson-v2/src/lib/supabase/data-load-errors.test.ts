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
  getMySubmissionForAssignment
} from "./assignments";
import {
  getClassroomById,
  getClassroomLabProgress,
  getClassroomReport,
  listClassroomTeachers,
  listCoTeacherCandidates,
  listTransferCandidates
} from "./classrooms";
import { getMyClassroomIds } from "./memberships";
import {
  getAdminSubmissionById,
  getPendingReviewSubmissions,
  getUserProjectSubmissions
} from "./project-submissions";

type QueryResult = {
  data: unknown;
  error: { message: string } | null;
};

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentSession: vi.fn(),
  logServerError: vi.fn()
}));

vi.mock("./auth", () => ({
  getCurrentSession: (...args: unknown[]) => mocks.getCurrentSession(...args)
}));

vi.mock("./server", () => ({
  createClient: (...args: unknown[]) => mocks.createClient(...args)
}));

vi.mock("@/lib/observability", () => ({
  logServerError: (...args: unknown[]) => mocks.logServerError(...args)
}));

function query(result: QueryResult) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn()
  };

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);
  chain.then.mockImplementation(
    (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject)
  );

  return chain;
}

describe("Supabase detail and report loader error semantics", () => {
  let rpcResults: Record<string, QueryResult>;
  let tableResults: Record<string, QueryResult>;

  const supabase = {
    rpc: vi.fn((name: string) => query(rpcResults[name] ?? { data: [], error: null })),
    from: vi.fn((name: string) => query(tableResults[name] ?? { data: [], error: null }))
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "real-anon-key");
    rpcResults = {};
    tableResults = {};
    mocks.createClient.mockResolvedValue(supabase);
    mocks.getCurrentSession.mockResolvedValue({
      user: { id: "student-1" },
      isAdmin: false
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const errorCases = [
    ["classroom detail", "rpc", "get_teacher_classroom", "teacher_classroom_unavailable", () => getClassroomById("class-1")],
    ["classroom report", "rpc", "get_classroom_report", "teacher_classroom_report_unavailable", () => getClassroomReport("class-1")],
    ["classroom lab progress", "rpc", "get_classroom_lab_progress", "teacher_classroom_lab_progress_unavailable", () => getClassroomLabProgress("class-1")],
    ["transfer candidates", "rpc", "list_classroom_transfer_candidates", "classroom_transfer_candidates_unavailable", () => listTransferCandidates("class-1")],
    ["classroom teachers", "rpc", "list_classroom_teachers", "classroom_teachers_unavailable", () => listClassroomTeachers("class-1")],
    ["co-teacher candidates", "rpc", "list_classroom_co_teacher_candidates", "classroom_co_teacher_candidates_unavailable", () => listCoTeacherCandidates("class-1")],
    ["classroom assignments", "table", "classroom_assignments", "teacher_classroom_assignments_unavailable", () => getClassroomAssignments("class-1")],
    ["assignment detail", "table", "classroom_assignments", "assignment_unavailable", () => getAssignmentById("assignment-1")],
    ["assignment report", "rpc", "get_assignment_report", "teacher_assignment_report_unavailable", () => getAssignmentReport("assignment-1")],
    ["student assignment submission", "table", "assignment_submissions", "student_assignment_submission_unavailable", () => getMySubmissionForAssignment("assignment-1")],
    ["classroom assessments", "table", "classroom_assessments", "teacher_classroom_assessments_unavailable", () => getClassroomAssessments("class-1")],
    ["teacher assessment classrooms", "rpc", "list_teacher_classrooms", "teacher_assessments_classrooms_unavailable", () => getTeacherAssessments()],
    ["teacher assessment detail", "table", "classroom_assessments", "teacher_assessment_unavailable", () => getTeacherAssessmentById("assessment-1")],
    ["student assessment detail", "rpc", "get_assessment_for_student", "student_assessment_unavailable", () => getStudentAssessmentById("assessment-1")],
    ["student assessment attempt", "table", "assessment_attempts", "student_assessment_attempt_unavailable", () => getMyAssessmentAttempt("assessment-1")],
    ["student assessment review", "rpc", "get_assessment_review", "student_assessment_review_unavailable", () => getMyAssessmentReview("assessment-1")],
    ["assessment report", "rpc", "get_assessment_report", "teacher_assessment_report_unavailable", () => getAssessmentReport("assessment-1")],
    ["assessment analysis", "rpc", "get_assessment_question_analysis", "teacher_assessment_analysis_unavailable", () => getAssessmentQuestionAnalysis("assessment-1")],
    ["student memberships", "table", "classroom_members", "student_classroom_memberships_unavailable", () => getMyClassroomIds()],
    ["student project submissions", "table", "project_submissions", "student_project_submissions_unavailable", () => getUserProjectSubmissions("student-1")],
    ["admin pending project reviews", "table", "project_submissions", "admin_pending_reviews_unavailable", () => getPendingReviewSubmissions()],
    ["admin project submission detail", "table", "project_submissions", "admin_submission_unavailable", () => getAdminSubmissionById("submission-1")]
  ] as const;

  it.each(errorCases)(
    "throws a stable error for %s failures",
    async (_label, source, name, event, loadData) => {
      const result = { data: null, error: { message: "database unavailable" } };
      if (source === "rpc") {
        rpcResults[name] = result;
      } else {
        tableResults[name] = result;
      }

      await expect(loadData()).rejects.toThrow(event);
      expect(mocks.logServerError).toHaveBeenCalledWith(event, {
        message: "database unavailable"
      });
    }
  );

  it("returns null only when detail queries succeed without a row", async () => {
    rpcResults.get_teacher_classroom = { data: null, error: null };
    rpcResults.get_assessment_for_student = { data: [], error: null };
    tableResults.classrooms = { data: null, error: null };
    tableResults.classroom_assignments = { data: null, error: null };
    tableResults.classroom_assessments = { data: null, error: null };
    tableResults.assignment_submissions = { data: null, error: null };
    tableResults.assessment_attempts = { data: null, error: null };
    tableResults.project_submissions = { data: null, error: null };

    await expect(getClassroomById("missing")).resolves.toBeNull();
    await expect(getAssignmentById("missing")).resolves.toBeNull();
    await expect(getTeacherAssessmentById("missing")).resolves.toBeNull();
    await expect(getStudentAssessmentById("missing")).resolves.toBeNull();
    await expect(getMySubmissionForAssignment("missing")).resolves.toBeNull();
    await expect(getMyAssessmentAttempt("missing")).resolves.toBeNull();
    await expect(getAdminSubmissionById("missing")).resolves.toBeNull();
    expect(mocks.logServerError).not.toHaveBeenCalled();
  });

  it("treats an unauthorized classroom detail as not found instead of an outage", async () => {
    rpcResults.get_teacher_classroom = {
      data: null,
      error: { message: "not_authorized" }
    };

    await expect(getClassroomById("foreign-class")).resolves.toBeNull();
    expect(mocks.logServerError).not.toHaveBeenCalled();
  });

  it("loads teacher assessments from the co-teacher-aware classroom RPC", async () => {
    rpcResults.list_teacher_classrooms = {
      data: [{ id: "co-taught-class" }],
      error: null
    };
    tableResults.classroom_assessments = { data: [], error: null };

    await expect(getTeacherAssessments()).resolves.toEqual([]);
    expect(supabase.rpc).toHaveBeenCalledWith("list_teacher_classrooms");
  });

  it("surfaces profile enrichment failures for admin project reviews", async () => {
    tableResults.project_submissions = {
      data: [{ id: "submission-1", user_id: "student-1" }],
      error: null
    };
    tableResults.profiles = { data: null, error: { message: "profiles unavailable" } };

    await expect(getPendingReviewSubmissions()).rejects.toThrow(
      "admin_submission_profiles_unavailable"
    );
    expect(mocks.logServerError).toHaveBeenCalledWith(
      "admin_submission_profiles_unavailable",
      { message: "profiles unavailable" }
    );
  });
});
