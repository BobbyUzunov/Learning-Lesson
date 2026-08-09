import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mockRpc = vi.fn();

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: vi.fn(() => false) }));
vi.mock("@/lib/supabase/e2e-auth", () => ({ isE2eAuthEnabled: vi.fn(() => true) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    rpc: mockRpc
  }))
}));

function request(body: unknown) {
  return new Request("http://localhost/api/knowledge-check/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("/api/knowledge-check/grade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(request({ lessonId: "1" }));
    expect(response.status).toBe(400);
  });

  it("grades against the secret fallback bank in e2e mode", async () => {
    const response = await POST(
      request({
        lessonId: "1",
        knowledgeCheckAnswers: [
          { questionId: "html-1", selectedIndex: 1 },
          { questionId: "html-2", selectedIndex: 1 },
          { questionId: "html-3", selectedIndex: 2 }
        ]
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.passed).toBe(true);
    expect(body.correct).toBe(3);
    expect(body.results).toHaveLength(3);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
