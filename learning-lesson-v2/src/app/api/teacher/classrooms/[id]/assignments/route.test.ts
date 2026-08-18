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
  return new Request("http://localhost/api/teacher/classrooms/class-1/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/teacher/classrooms/[id]/assignments", () => {
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
        id: "assignment-1",
        classroom_id: "class-1",
        mission_id: "mission-1",
        due_at: "2026-09-01T09:00:00.000Z",
        instructions: "Build a page",
        created_at: "2026-08-12T09:00:00.000Z"
      },
      error: null
    });
  });

  it("assigns a mission through the authorized RPC", async () => {
    const response = await POST(
      request({
        missionId: " mission-1 ",
        dueAt: "2026-09-01T09:00:00.000Z",
        instructions: "  Build a page  "
      }),
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      assignment: {
        id: "assignment-1",
        classroomId: "class-1",
        missionId: "mission-1"
      }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("create_classroom_assignment", {
      p_classroom_id: "class-1",
      p_mission_id: "mission-1",
      p_due_at: "2026-09-01T09:00:00.000Z",
      p_instructions: "Build a page"
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/classes/class-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/classes");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it.each([
    [{ missionId: "" }, "invalid_mission"],
    [{ missionId: "mission-1", dueAt: "not-a-date" }, "invalid_due_at"],
    [{ missionId: "mission-1", instructions: "x".repeat(2001) }, "invalid_instructions"]
  ])("rejects invalid assignment input before the RPC", async (body, error) => {
    const response = await POST(request(body), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["teacher_required", 403],
    ["not_authorized", 403],
    ["assignment_exists", 409],
    ["unknown_mission", 400],
    ["invalid_instructions", 400]
  ])("maps %s to a stable public response", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ missionId: "mission-1" }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown database errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "relation private.secret failed" } });

    const response = await POST(request({ missionId: "mission-1" }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "assignment_failed" });
  });
});
