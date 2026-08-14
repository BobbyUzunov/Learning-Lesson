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

function request() {
  return new Request("http://localhost/api/teacher/classrooms/class-1/teachers/teacher-2/remove", {
    method: "POST"
  });
}

const context = { params: Promise.resolve({ id: "class-1", userId: "teacher-2" }) };

describe("POST /api/teacher/classrooms/[id]/teachers/[userId]/remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({ data: { user_id: "teacher-2", removed: true }, error: null });
  });

  it("removes a co-teacher id", async () => {
    const response = await POST(request(), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      teacher: { userId: "teacher-2", removed: true }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("remove_classroom_co_teacher", {
      p_classroom_id: "class-1",
      p_user_id: "teacher-2"
    });
  });

  it.each([
    ["not_authenticated", 401],
    ["classroom_not_found", 404],
    ["not_authorized", 403],
    ["invalid_co_teacher", 400],
    ["cannot_remove_owner", 400]
  ])("maps the remove_classroom_co_teacher %s code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request(), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown remove-co-teacher errors", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "private.classroom_teachers constraint failed" }
    });

    const response = await POST(request(), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "remove_co_teacher_failed" });
  });
});
