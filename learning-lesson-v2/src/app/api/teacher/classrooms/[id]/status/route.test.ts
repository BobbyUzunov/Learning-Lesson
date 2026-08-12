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
vi.mock("@/lib/supabase/teacher-auth", () => ({ requireTeacherUser: mocks.requireTeacherUser }));

function request(body: unknown) {
  return new Request("http://localhost/api/teacher/classrooms/class-1/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/teacher/classrooms/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({
      data: { id: "class-1", status: "archived", join_code_enabled: false },
      error: null
    });
  });

  it("archives a classroom and returns the disabled join-code state", async () => {
    const response = await POST(request({ status: "archived" }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      classroom: { id: "class-1", status: "archived", joinCodeEnabled: false }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("update_classroom_status", {
      p_classroom_id: "class-1",
      p_status: "archived"
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/classes/class-1");
  });

  it("rejects an unsupported classroom status before the RPC", async () => {
    const response = await POST(request({ status: "deleted" }), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_status" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["invalid_status", 400],
    ["not_authorized", 403]
  ])("maps the update_classroom_status %s code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ status: "active" }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown classroom-status update errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "private.classrooms check constraint failed" } });

    const response = await POST(request({ status: "active" }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "status_update_failed" });
  });
});
