import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { guestProgressClaimCookie, guestProgressClaimPath } from "@/lib/guest-progress-claim";
import { POST } from "./route";

const { mockCreateAdminClient, mockHasSupabaseAdminEnv, mockRpc, mockSingle } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
  mockHasSupabaseAdminEnv: vi.fn(() => true),
  mockRpc: vi.fn(),
  mockSingle: vi.fn()
}));

vi.mock("@/lib/supabase/admin-env", () => ({
  hasSupabaseAdminEnv: mockHasSupabaseAdminEnv
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient
}));
vi.mock("@/lib/observability", () => ({ logServerError: vi.fn() }));

function request(body: unknown) {
  return new Request("http://localhost/api/progress/guest", {
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

describe("/api/progress/guest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasSupabaseAdminEnv.mockReturnValue(true);
    mockCreateAdminClient.mockReturnValue({ rpc: mockRpc });
    mockRpc.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: {
        ok: true,
        claim_token: "a".repeat(64),
        expires_at: "2026-08-16T00:00:00.000Z"
      },
      error: null
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects invalid completion evidence without calling the RPC", async () => {
    const response = await POST(request({ lessonId: "1" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_guest_progress" });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("fails closed without the server-only Supabase credential", async () => {
    mockHasSupabaseAdminEnv.mockReturnValue(false);

    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "supabase_not_configured" });
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("uses local grading only behind the production-safe E2E guard", async () => {
    mockHasSupabaseAdminEnv.mockReturnValue(false);
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "");

    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toMatch(
      new RegExp(`${guestProgressClaimCookie}=[0-9a-f]{64}`)
    );
  });

  it("never enables the local fallback on Vercel production", async () => {
    mockHasSupabaseAdminEnv.mockReturnValue(false);
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "1");
    vi.stubEnv("CI", "true");

    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));

    expect(response.status).toBe(503);
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it("issues a server-verified claim and exposes it only as an HttpOnly cookie", async () => {
    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mockRpc).toHaveBeenCalledWith("issue_guest_progress_claim", {
      p_lesson_id: "1",
      p_answers: knowledgeCheckAnswers
    });

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${guestProgressClaimCookie}=${"a".repeat(64)}`);
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
    expect(setCookie).toContain(`Path=${guestProgressClaimPath}`);
  });

  it("does not issue a cookie when the server rejects the knowledge check", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "quiz_not_passed" } });

    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "quiz_not_passed" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("maps an unavailable knowledge check to a retryable service error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "quiz_unavailable" } });

    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "quiz_unavailable" });
  });

  it("maps the bounded issuance rate to 429 without issuing a cookie", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "guest_claim_rate_limited" }
    });

    const response = await POST(request({ lessonId: "1", knowledgeCheckAnswers }));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "guest_claim_rate_limited" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
