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
  return new Request("http://localhost/api/assignments/assignment-1/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const context = { params: Promise.resolve({ id: "assignment-1" }) };

describe("POST /api/assignments/[id]/submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "student-1" } } });
    mocks.rpc.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({
      data: {
        id: "submission-1",
        assignment_id: "assignment-1",
        status: "submitted",
        submitted_at: "2026-08-12T09:00:00.000Z"
      },
      error: null
    });
  });

  it("submits normalized deliverables and returns the submission contract", async () => {
    const response = await POST(
      request({ deliverableText: "  My solution  ", deliverableUrl: " https://example.com/work " }),
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      submission: {
        id: "submission-1",
        assignmentId: "assignment-1",
        status: "submitted",
        submittedAt: "2026-08-12T09:00:00.000Z"
      }
    });
    expect(mocks.rpc).toHaveBeenCalledWith("submit_assignment", {
      p_assignment_id: "assignment-1",
      p_deliverable_text: "My solution",
      p_deliverable_url: "https://example.com/work"
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/assignments/assignment-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/teacher");
  });

  it("requires authentication before parsing a deliverable", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(request({ deliverableText: "My solution" }), context);

    expect(response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("requires at least one deliverable", async () => {
    const response = await POST(request({ deliverableText: " ", deliverableUrl: " " }), context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "deliverable_required" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["not_authenticated", 401],
    ["not_authorized", 403],
    ["assignment_not_found", 404],
    ["deliverable_required", 400],
    ["invalid_deliverable_text", 400],
    ["invalid_deliverable_url", 400]
  ])("preserves the expected %s RPC code", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message } });

    const response = await POST(request({ deliverableText: "My solution" }), context);

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("does not leak unknown submit_assignment database errors", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "private.student_email constraint failed" } });

    const response = await POST(request({ deliverableText: "My solution" }), context);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "submission_failed" });
  });
});
