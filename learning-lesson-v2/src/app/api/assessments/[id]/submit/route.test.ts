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
  return new Request("http://localhost/api/assessments/assessment-1/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "assessment-1" }) };

describe("POST /api/assessments/[id]/submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "student-1" } } });
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({
      data: {
        id: "attempt-1",
        assessment_id: "assessment-1",
        score: 2,
        max_score: 3,
        percentage: "66.67",
        submitted_at: "2026-08-12T11:00:00.000Z"
      },
      error: null
    });
  });

  it("submits the full answer map and normalizes numeric results", async () => {
    const answers = { "question-1": 1, "question-2": 0 };
    const response = await POST(request({ answers }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      attempt: {
        id: "attempt-1",
        assessmentId: "assessment-1",
        score: 2,
        maxScore: 3,
        percentage: 66.67,
        submittedAt: "2026-08-12T11:00:00.000Z"
      }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("submit_assessment", {
      p_assessment_id: "assessment-1",
      p_answers: answers
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/assessments/assessment-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher/assessments");
  });

  it.each([
    [{}, "invalid_answers"],
    [{ answers: [] }, "invalid_answers"],
    [{ answers: { "question-1": -1 } }, "invalid_answers"],
    [{ answers: { "question-1": 1.5 } }, "invalid_answers"]
  ])("rejects malformed answer maps before the RPC", async (body, error) => {
    const response = await POST(request(body), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["assessment_not_found", 404],
    ["attempt_exists", 409],
    ["assessment_closed", 400],
    ["assessment_expired", 400],
    ["all_answers_required", 400],
    ["invalid_answers", 400]
  ])("maps %s to a stable public response", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ answers: { "question-1": 0 } }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown database errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "secret internal detail" } });

    const response = await POST(request({ answers: { "question-1": 0 } }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "submit_failed" });
  });
});
