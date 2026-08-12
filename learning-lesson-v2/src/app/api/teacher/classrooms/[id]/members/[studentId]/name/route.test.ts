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
  return new Request("http://localhost/api/teacher/classrooms/class-1/members/student-1/name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1", studentId: "student-1" }) };

describe("POST /api/teacher/classrooms/[id]/members/[studentId]/name", () => {
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
        classroom_id: "class-1",
        student_id: "student-1",
        roster_name: "Maria Ivanova",
        display_name: "Maria Ivanova"
      },
      error: null
    });
  });

  it("updates a classroom member roster name", async () => {
    const response = await POST(request({ rosterName: "Maria Ivanova" }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      member: {
        classroomId: "class-1",
        studentId: "student-1",
        rosterName: "Maria Ivanova",
        displayName: "Maria Ivanova"
      }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("set_classroom_member_name", {
      p_classroom_id: "class-1",
      p_student_id: "student-1",
      p_roster_name: "Maria Ivanova"
    });
  });

  it("rejects a roster name longer than the database limit", async () => {
    const response = await POST(request({ rosterName: "x".repeat(81) }), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_name" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["invalid_name", 400],
    ["member_not_found", 404]
  ])("maps the set_classroom_member_name %s code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ rosterName: "Maria" }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown member-name update errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "private.profiles email leaked" } });

    const response = await POST(request({ rosterName: "Maria" }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "member_name_update_failed" });
  });
});
