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
  return new Request("http://localhost/api/teacher/classrooms/class-1/specialty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/teacher/classrooms/[id]/specialty", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({
      data: { id: "class-1", specialty_id: "software-development" },
      error: null
    });
  });

  it("saves the classroom specialty", async () => {
    const response = await POST(request({ specialtyId: "software-development" }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      classroom: { id: "class-1", specialtyId: "software-development" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("update_classroom_specialty", {
      p_classroom_id: "class-1",
      p_specialty_id: "software-development"
    });
  });

  it("rejects an empty specialty before the RPC", async () => {
    const response = await POST(request({ specialtyId: "  " }), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_specialty" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
