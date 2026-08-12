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

const request = new Request("http://localhost/api/teacher/classrooms/class-1/join-code/rotate", {
  method: "POST"
});
const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/teacher/classrooms/[id]/join-code/rotate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({ data: { id: "class-1", join_code: "NEW123" }, error: null });
  });

  it("rotates the join code and revalidates the classroom", async () => {
    const response = await POST(request, context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      classroom: { id: "class-1", joinCode: "NEW123" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("rotate_classroom_join_code", { p_classroom_id: "class-1" });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/classes/class-1");
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["join_code_generation_failed", 500]
  ])("maps the rotate_classroom_join_code %s code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request, context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown join-code rotation errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "private.classrooms join index failed" } });

    const response = await POST(request, context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "join_code_rotation_failed" });
  });
});
