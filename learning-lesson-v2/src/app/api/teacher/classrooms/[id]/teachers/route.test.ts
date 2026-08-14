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
  return new Request("http://localhost/api/teacher/classrooms/class-1/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/teacher/classrooms/[id]/teachers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({ data: { user_id: "teacher-2", role: "co_teacher" }, error: null });
  });

  it("adds a validated co-teacher id", async () => {
    const response = await POST(request({ userId: " teacher-2 " }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      teacher: { userId: "teacher-2", role: "co_teacher" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("add_classroom_co_teacher", {
      p_classroom_id: "class-1",
      p_user_id: "teacher-2"
    });
  });

  it("rejects a missing user id before calling the RPC", async () => {
    const response = await POST(request({ userId: " " }), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_co_teacher" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["classroom_not_found", 404],
    ["not_authorized", 403],
    ["invalid_co_teacher", 400],
    ["already_classroom_teacher", 400]
  ])("maps the add_classroom_co_teacher %s code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ userId: "teacher-2" }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown add-co-teacher errors", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "private.classroom_teachers constraint failed" }
    });

    const response = await POST(request({ userId: "teacher-2" }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "add_co_teacher_failed" });
  });
});
