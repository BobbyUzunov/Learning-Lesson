import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(() => false),
  isE2eAuthEnabled: vi.fn(() => true),
  getUser: vi.fn(),
  consumeRateLimit: vi.fn(() => Promise.resolve(true)),
  rpc: vi.fn()
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/e2e-auth", () => ({ isE2eAuthEnabled: mocks.isE2eAuthEnabled }));
vi.mock("@/lib/http/rate-limit", () => ({ consumeRateLimit: mocks.consumeRateLimit }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc
  }))
}));

function request(body: unknown) {
  return new Request("http://localhost/api/knowledge-check/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const passingAnswers = {
  lessonId: "1",
  knowledgeCheckAnswers: [
    { questionId: "html-1", selectedIndex: 1 },
    { questionId: "html-2", selectedIndex: 1 },
    { questionId: "html-3", selectedIndex: 2 }
  ]
};

describe("/api/knowledge-check/grade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.isE2eAuthEnabled.mockReturnValue(true);
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    mocks.consumeRateLimit.mockResolvedValue(true);
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(request({ lessonId: "1" }));
    expect(response.status).toBe(400);
  });

  it("grades against the secret fallback bank in e2e mode", async () => {
    const response = await POST(request(passingAnswers));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.passed).toBe(true);
    expect(body.correct).toBe(3);
    expect(body.results).toHaveLength(3);
    expect(
      body.results.every((item: { correctIndex?: number }) => !("correctIndex" in item))
    ).toBe(true);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated grading when Supabase is configured", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.isE2eAuthEnabled.mockReturnValue(false);

    const response = await POST(request(passingAnswers));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "not_authenticated" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
