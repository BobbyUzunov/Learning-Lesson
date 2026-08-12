import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(() => true),
  requireTeacherUser: vi.fn(),
  rpc: vi.fn(),
  single: vi.fn(),
  revalidatePath: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/teacher-auth", () => ({
  requireTeacherUser: mocks.requireTeacherUser
}));

function request(body: unknown) {
  return new Request("http://localhost/api/teacher/submissions/submission-1/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "submission-1" }) };

describe("POST /api/teacher/submissions/[id]/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({
      data: {
        id: "submission-1",
        assignment_id: "assignment-1",
        status: "needs_changes",
        reviewed_at: "2026-08-12T10:00:00.000Z"
      },
      error: null
    });
  });

  it("requests changes with a normalized teacher note", async () => {
    const response = await POST(
      request({ action: "request_changes", teacherNote: "  Add semantic headings  " }),
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      submission: { id: "submission-1", assignmentId: "assignment-1", status: "needs_changes" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("review_assignment_submission", {
      p_submission_id: "submission-1",
      p_status: "needs_changes",
      p_teacher_note: "Add semantic headings"
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/assignments/assignment-1");
  });

  it("maps approve to the approved database status", async () => {
    mocks.single.mockResolvedValue({
      data: {
        id: "submission-1",
        assignment_id: "assignment-1",
        status: "approved",
        reviewed_at: "2026-08-12T10:00:00.000Z"
      },
      error: null
    });

    await POST(request({ action: "approve", teacherNote: "" }), context);

    expect(mocks.rpc).toHaveBeenCalledWith("review_assignment_submission", {
      p_submission_id: "submission-1",
      p_status: "approved",
      p_teacher_note: ""
    });
  });

  it.each([
    [{ action: "reject" }, "invalid_action"],
    [{ action: "request_changes", teacherNote: "no" }, "teacher_note_required"]
  ])("rejects invalid review input before the RPC", async (body, error) => {
    const response = await POST(request(body), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["submission_not_found", 404],
    ["invalid_status", 400],
    ["teacher_note_required", 400],
    ["invalid_teacher_note", 400],
    ["not_ready_for_review", 400]
  ])("preserves the expected %s RPC code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ action: "approve" }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown review database errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "relation private.reviews failed" } });

    const response = await POST(request({ action: "approve" }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "review_failed" });
  });
});
