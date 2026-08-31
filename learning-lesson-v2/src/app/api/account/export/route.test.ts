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
  hasSupabaseEnv: vi.fn(() => true)
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
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
      throw new Error(`Unexpected table ${table}`);
    }
  }))
}));

describe("GET /api/account/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "student@school.bg" } } });
    mocks.profileMaybeSingle.mockResolvedValue({
      data: { id: "user-1", email: "student@school.bg", display_name: "Student", role: "user" },
      error: null
    });
    mocks.progressEq.mockResolvedValue({ data: [{ lesson_id: "1", completed: true }], error: null });
    mocks.projectEq.mockResolvedValue({ data: [], error: null });
    mocks.assignmentEq.mockResolvedValue({ data: [], error: null });
    mocks.membershipEq.mockResolvedValue({ data: [{ classroom_id: "class-1" }], error: null });
    mocks.mentorOrder.mockResolvedValue({ data: [], error: null });
  });

  it("requires authentication", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns a downloadable JSON export", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain("learning-lesson-export-user-1.json");
    const body = await response.json();
    expect(body.userId).toBe("user-1");
    expect(body.progress).toHaveLength(1);
    expect(body.classroomMemberships).toHaveLength(1);
  });
});
