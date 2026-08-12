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
  return new Request("http://localhost/api/teacher/classrooms/class-1/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };
const questions = [
  {
    prompt: "Which element is semantic?",
    options: ["div", "main", "span"],
    correctOption: 1,
    explanation: "main describes the primary content.",
    points: 2
  },
  {
    prompt: "Which property changes text color?",
    options: ["color", "display", "margin"],
    correctOption: 0,
    explanation: "color controls the foreground color.",
    points: 1
  }
];

describe("POST /api/teacher/classrooms/[id]/assessments", () => {
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
        id: "assessment-1",
        classroom_id: "class-1",
        title: "HTML Check",
        assessment_type: "formative",
        status: "published",
        due_at: null,
        duration_minutes: 20,
        created_at: "2026-08-12T09:00:00.000Z"
      },
      error: null
    });
  });

  it("publishes a validated assessment and all question answer indexes", async () => {
    const response = await POST(
      request({
        title: "  HTML Check  ",
        description: "  Pilot formative check  ",
        type: "formative",
        dueAt: null,
        durationMinutes: 20,
        questions
      }),
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      assessment: {
        id: "assessment-1",
        classroomId: "class-1",
        title: "HTML Check",
        type: "formative",
        status: "published"
      }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("create_classroom_assessment", {
      p_classroom_id: "class-1",
      p_title: "HTML Check",
      p_description: "Pilot formative check",
      p_assessment_type: "formative",
      p_due_at: null,
      p_duration_minutes: 20,
      p_questions: questions
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/classes/class-1/assessments");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it.each([
    [{ title: "x", type: "formative", durationMinutes: 20, questions }, "invalid_title"],
    [{ title: "Check", type: "unknown", durationMinutes: 20, questions }, "invalid_assessment_type"],
    [{ title: "Check", type: "formative", durationMinutes: 2, questions }, "invalid_duration"],
    [{ title: "Check", type: "formative", durationMinutes: 20, questions: questions.slice(0, 1) }, "invalid_questions"],
    [
      {
        title: "Check",
        type: "formative",
        durationMinutes: 20,
        questions: [{ ...questions[0], correctOption: 9 }, questions[1]]
      },
      "invalid_questions"
    ]
  ])("rejects invalid assessment input before the RPC", async (body, error) => {
    const response = await POST(request(body), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["invalid_title", 400],
    ["invalid_description", 400],
    ["invalid_assessment_type", 400],
    ["invalid_duration", 400],
    ["invalid_questions", 400],
    ["invalid_question", 400],
    ["invalid_question_prompt", 400],
    ["invalid_question_options", 400],
    ["invalid_correct_option", 400],
    ["invalid_points", 400],
    ["invalid_explanation", 400]
  ])("maps the create_classroom_assessment %s code to a stable response", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(
      request({ title: "HTML Check", type: "formative", durationMinutes: 20, questions }),
      context
    );

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown create assessment database errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "private.answer_key constraint failed" } });

    const response = await POST(
      request({ title: "HTML Check", type: "formative", durationMinutes: 20, questions }),
      context
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "assessment_failed" });
  });
});
