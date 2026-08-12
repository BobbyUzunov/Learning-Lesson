import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(() => true),
  createClient: vi.fn(),
  getUser: vi.fn(),
  rpc: vi.fn(),
  single: vi.fn(),
  revalidatePath: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

function request(body: unknown) {
  return new Request("http://localhost/api/classrooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/classrooms/join", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.createClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
      rpc: mocks.rpc
    });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "student-1" } } });
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({
      data: { classroom_id: "class-1", name: "8A Pilot", error_code: null },
      error: null
    });
  });

  it("normalizes the join code and returns the joined classroom", async () => {
    const response = await POST(request({ joinCode: " abcd12 " }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      classroom: { id: "class-1", name: "8A Pilot" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("join_classroom", { p_join_code: "ABCD12" });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/classes");
  });

  it("rejects malformed join codes before creating a Supabase client", async () => {
    const response = await POST(request({ joinCode: "ABC" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_join_code" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("requires an authenticated student", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(request({ joinCode: "ABCD12" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "not_authenticated" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["join_rate_limited", 429],
    ["classroom_not_found", 404],
    ["classroom_unavailable", 403],
    ["teacher_cannot_join", 403],
    ["already_member", 400]
  ])("maps the expected %s result to HTTP %i", async (errorCode, status) => {
    mocks.single.mockResolvedValue({
      data: { classroom_id: null, name: null, error_code: errorCode },
      error: null
    });

    const response = await POST(request({ joinCode: "ABCD12" }));

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: errorCode });
  });

  it("does not leak unknown database errors", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "sensitive database detail" }
    });

    const response = await POST(request({ joinCode: "ABCD12" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "join_failed" });
  });
});
