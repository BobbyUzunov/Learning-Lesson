import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(() => true),
  requireTeacherUser: vi.fn(),
  getSubmissionReviewHistory: vi.fn()
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/teacher-auth", () => ({
  requireTeacherUser: mocks.requireTeacherUser
}));
vi.mock("@/lib/supabase/assignments", () => ({
  getSubmissionReviewHistory: mocks.getSubmissionReviewHistory
}));

const context = { params: Promise.resolve({ id: "submission-1" }) };

describe("GET /api/teacher/submissions/[id]/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: {}
    });
    mocks.getSubmissionReviewHistory.mockResolvedValue([
      {
        id: "hist-1",
        submissionId: "submission-1",
        status: "approved",
        teacherNote: null,
        deliverableText: "Done",
        deliverableUrl: null,
        eventType: "teacher_review",
        reviewedAt: "2026-10-01T10:00:00.000Z",
        createdAt: "2026-10-01T10:00:00.000Z"
      }
    ]);
  });

  it("returns mapped history for teachers", async () => {
    const response = await GET(new Request("http://localhost/api/teacher/submissions/submission-1/history"), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      history: [{ id: "hist-1", submissionId: "submission-1", eventType: "teacher_review" }]
    });
    expect(mocks.getSubmissionReviewHistory).toHaveBeenCalledWith("submission-1");
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["submission_not_found", 404]
  ])("maps %s loader failures", async (message, status) => {
    mocks.getSubmissionReviewHistory.mockRejectedValue(new Error(message));

    const response = await GET(new Request("http://localhost/api/teacher/submissions/submission-1/history"), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });
});
