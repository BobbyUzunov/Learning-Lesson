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
  return new Request("http://localhost/api/teacher/classrooms/class-1/join-code/enabled", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/teacher/classrooms/[id]/join-code/enabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({
      data: { id: "class-1", join_code_enabled: false },
      error: null
    });
  });

  it("updates the join-code flag through the owner-scoped RPC", async () => {
    const response = await POST(request({ enabled: false }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      classroom: { id: "class-1", joinCodeEnabled: false }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("set_classroom_join_code_enabled", {
      p_classroom_id: "class-1",
      p_enabled: false
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/classes/class-1");
  });

  it("rejects a non-boolean flag before calling the RPC", async () => {
    const response = await POST(request({ enabled: "false" }), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_enabled" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["classroom_archived", 400]
  ])("maps the set_classroom_join_code_enabled %s code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ enabled: false }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown join-code update errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "private.join_code constraint failed" } });

    const response = await POST(request({ enabled: false }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "join_code_update_failed" });
  });
});
