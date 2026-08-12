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

const context = { params: Promise.resolve({ id: "assessment-1" }) };
const request = new Request("http://localhost/api/teacher/assessments/assessment-1/close", {
  method: "POST"
});

describe("POST /api/teacher/assessments/[id]/close", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({
      data: { id: "assessment-1", status: "closed" },
      error: null
    });
  });

  it("closes the assessment through the teacher-scoped RPC", async () => {
    const response = await POST(request, context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      assessment: { id: "assessment-1", status: "closed" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("close_classroom_assessment", {
      p_assessment_id: "assessment-1"
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/assessments/assessment-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["assessment_not_found", 404]
  ])("maps %s to a stable public response", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request, context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown database errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "secret internal detail" } });

    const response = await POST(request, context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "close_failed" });
  });
});
