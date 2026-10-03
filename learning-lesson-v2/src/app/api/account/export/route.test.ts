import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  profileMaybeSingle: vi.fn(),
  progressEq: vi.fn(),
  projectEq: vi.fn(),
  assignmentEq: vi.fn(),
  membershipEq: vi.fn(),
  mentorOrder: vi.fn(),
  mentorHintsOrder: vi.fn(),
  assessmentOrder: vi.fn(),
  reviewHistoryRpc: vi.fn(),
  hasSupabaseEnv: vi.fn(() => true),
  consumeRateLimit: vi.fn(() => Promise.resolve("allowed"))
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/http/rate-limit", () => ({ consumeRateLimit: mocks.consumeRateLimit }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    rpc: (name: string) => {
      if (name === "export_my_assignment_review_history") {
        return mocks.reviewHistoryRpc();
      }
      throw new Error(`Unexpected rpc ${name}`);
    },
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mocks.profileMaybeSingle
            })
          })
        };
      }
      if (table === "user_progress") {
        return { select: () => ({ eq: mocks.progressEq }) };
      }
      if (table === "project_submissions") {
        return { select: () => ({ eq: mocks.projectEq }) };
      }
      if (table === "assignment_submissions") {
        return { select: () => ({ eq: mocks.assignmentEq }) };
      }
      if (table === "classroom_members") {
        return { select: () => ({ eq: mocks.membershipEq }) };
      }
      if (table === "mentor_daily_usage") {
        return {
          select: () => ({
            eq: () => ({
              order: mocks.mentorOrder
            })
          })
        };
      }
      if (table === "assignment_mentor_hints") {
        return {
          select: () => ({
            eq: () => ({
              order: mocks.mentorHintsOrder
            })
          })
        };
      }
      if (table === "assessment_attempts") {
        return {
          select: () => ({
            eq: () => ({
              order: mocks.assessmentOrder
            })
          })
        };
      }
      throw new Error(`Unexpected table ${table}`);
    }
  }))
}));

describe("GET /api/account/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "student@school.bg",
          user_metadata: { privacy_accepted_at: "2026-08-01T00:00:00.000Z" }
        }
      }
    });
    mocks.profileMaybeSingle.mockResolvedValue({
      data: { id: "user-1", email: "student@school.bg", display_name: "Student", role: "user" },
      error: null
    });
    mocks.progressEq.mockResolvedValue({ data: [{ lesson_id: "1", completed: true }], error: null });
    mocks.projectEq.mockResolvedValue({ data: [{ review_notes: "ok" }], error: null });
    mocks.assignmentEq.mockResolvedValue({ data: [], error: null });
    mocks.membershipEq.mockResolvedValue({ data: [{ classroom_id: "class-1" }], error: null });
    mocks.mentorOrder.mockResolvedValue({ data: [], error: null });
    mocks.mentorHintsOrder.mockResolvedValue({ data: [{ hint_level: 1, effort: "draft" }], error: null });
    mocks.assessmentOrder.mockResolvedValue({ data: [{ score: 8 }], error: null });
    mocks.reviewHistoryRpc.mockResolvedValue({ data: [{ event_type: "teacher_review" }], error: null });
    mocks.consumeRateLimit.mockResolvedValue("allowed");
  });

  it("requires authentication", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await GET(new Request("http://localhost/api/account/export"));
    expect(response.status).toBe(401);
  });

  it("returns a downloadable JSON export with personal learning history", async () => {
    const response = await GET(new Request("http://localhost/api/account/export"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain("learning-lesson-export-user-1.json");
    const body = await response.json();
    expect(body.userId).toBe("user-1");
    expect(body.consent).toEqual({ privacy_accepted_at: "2026-08-01T00:00:00.000Z" });
    expect(body.progress).toHaveLength(1);
    expect(body.classroomMemberships).toHaveLength(1);
    expect(body.mentorHintHistory).toHaveLength(1);
    expect(body.assessmentAttempts).toHaveLength(1);
    expect(body.assignmentReviewHistory).toHaveLength(1);
    expect(body.projectSubmissions[0]).toMatchObject({ review_notes: "ok" });
  });
});
