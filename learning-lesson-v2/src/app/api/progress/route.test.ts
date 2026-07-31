import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mockGetUser = vi.fn();
const mockRpc = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: vi.fn(() => true) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    rpc: mockRpc
  }))
}));

function request(body: unknown) {
  return new Request("http://localhost/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const knowledgeCheckAnswers = [
  { questionId: "html-1", selectedIndex: 1 },
  { questionId: "html-2", selectedIndex: 1 },
  { questionId: "html-3", selectedIndex: 2 }
];

// The API/RPC contract always uses indexes from the persisted database option
// order. The knowledge-check UI may shuffle options for display, but it must translate the
// selected display index back to these stable indexes before posting.
const cssAnswersInDatabaseOrder = [
  { questionId: "css-2", selectedIndex: 0 },
  { questionId: "css-1", selectedIndex: 1 },
  { questionId: "css-3", selectedIndex: 1 }
];

describe("/api/progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRpc.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: { ok: true, xp: 100, level: 2 }, error: null });
  });

  it("rejects completion without a valid knowledge-check attempt", async () => {
    const response = await POST(request({ lessonId: "1" }));
    expect(response.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));
    expect(response.status).toBe(401);
  });

  it("delegates validated completion to the protected database function", async () => {
    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, xp: 100, level: 2 });
    expect(mockRpc).toHaveBeenCalledWith("complete_lesson", {
      p_lesson_id: "1",
      p_answers: knowledgeCheckAnswers
    });
  });

  it("forwards stable database option indexes after client-side shuffling", async () => {
    const response = await POST(
      request({ lessonId: "2", knowledgeCheckAnswers: cssAnswersInDatabaseOrder })
    );

    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("complete_lesson", {
      p_lesson_id: "2",
      p_answers: cssAnswersInDatabaseOrder
    });
  });

  it("accepts the legacy answer field during the compatibility window", async () => {
    const response = await POST(request({ lessonId: "1", quizAnswers: knowledgeCheckAnswers }));
    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("complete_lesson", {
      p_lesson_id: "1",
      p_answers: knowledgeCheckAnswers
    });
  });

  it("keeps the legacy rejection code for cached clients", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "quiz_not_passed" } });
    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "quiz_not_passed" });
  });

  it("keeps the legacy unavailable code as a retryable service error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "quiz_unavailable" } });
    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "quiz_unavailable" });
  });
});
