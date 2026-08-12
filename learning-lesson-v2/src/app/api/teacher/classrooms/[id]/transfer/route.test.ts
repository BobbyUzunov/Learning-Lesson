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
  return new Request("http://localhost/api/teacher/classrooms/class-1/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/teacher/classrooms/[id]/transfer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({ data: { id: "class-1", teacher_id: "teacher-2" }, error: null });
  });

  it("transfers ownership to a validated teacher id", async () => {
    const response = await POST(request({ newOwnerId: " teacher-2 " }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      classroom: { id: "class-1", teacherId: "teacher-2" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("transfer_classroom", {
      p_classroom_id: "class-1",
      p_new_owner_id: "teacher-2"
    });
  });

  it("rejects a missing owner before calling the RPC", async () => {
    const response = await POST(request({ newOwnerId: " " }), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_owner" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["classroom_not_found", 404],
    ["not_authorized", 403],
    ["invalid_new_owner", 400]
  ])("maps the transfer_classroom %s code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ newOwnerId: "teacher-2" }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown classroom-transfer errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "private.classroom_teachers constraint failed" } });

    const response = await POST(request({ newOwnerId: "teacher-2" }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "transfer_failed" });
  });
});
