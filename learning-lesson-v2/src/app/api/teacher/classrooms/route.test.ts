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
  return new Request("http://localhost/api/teacher/classrooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/teacher/classrooms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.requireTeacherUser.mockResolvedValue({
      user: { id: "teacher-1" },
      supabase: { rpc: mocks.rpc }
    });
    mocks.single.mockResolvedValue({
      data: { id: "class-1", name: "8A Pilot", join_code: "ABCD12" },
      error: null
    });
  });

  it("creates a classroom with normalized API input and revalidates teacher hubs", async () => {
    const response = await POST(
      request({
        name: "  8A Pilot  ",
        description: "  Web class  ",
        specialtyId: "web-development",
        gradeLevel: 8,
        academicYear: "2026/2027"
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      classroom: { id: "class-1", name: "8A Pilot", joinCode: "ABCD12" }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("create_classroom", {
      p_name: "8A Pilot",
      p_description: "Web class",
      p_specialty_id: "web-development",
      p_grade_level: 8,
      p_academic_year: "2026/2027"
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/classes");
  });

  it.each([
    [{ name: "" }, "invalid_name"],
    [{ name: "Pilot" }, "invalid_specialty"],
    [{ name: "Pilot", specialtyId: "software-development", gradeLevel: 7 }, "invalid_grade"],
    [{ name: "Pilot", specialtyId: "software-development", academicYear: "2026" }, "invalid_academic_year"]
  ])("rejects invalid classroom input before calling the RPC", async (body, error) => {
    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns the teacher authorization response without calling the RPC", async () => {
    mocks.requireTeacherUser.mockResolvedValue({
      error: Response.json({ error: "teacher_required" }, { status: 403 })
    });

    const response = await POST(request({ name: "Pilot", specialtyId: "software-development" }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "teacher_required" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["teacher_required", 403],
    ["invalid_name", 400],
    ["invalid_description", 400],
    ["invalid_grade", 400],
    ["invalid_academic_year", 400],
    ["unknown_specialty", 400],
    ["join_code_generation_failed", 500]
  ])("maps the create_classroom %s code to a stable public response", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ name: "Pilot", specialtyId: "software-development" }));

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown create_classroom database errors", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "duplicate key violates private classroom constraint" }
    });

    const response = await POST(request({ name: "Pilot", specialtyId: "software-development" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "classroom_failed" });
  });

  it("fails closed when Supabase is not configured", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);

    const response = await POST(request({ name: "Pilot", specialtyId: "software-development" }));

    expect(response.status).toBe(503);
    expect(mocks.requireTeacherUser).not.toHaveBeenCalled();
  });
});
