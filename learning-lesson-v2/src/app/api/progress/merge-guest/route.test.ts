import { beforeEach, describe, expect, it, vi } from "vitest";
import { guestProgressClaimCookie, guestProgressClaimPath } from "@/lib/guest-progress-claim";
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
vi.mock("@/lib/observability", () => ({ logServerError: vi.fn() }));

const claimToken = "b".repeat(64);

function request(body: unknown, withClaim = true) {
  return new Request("http://localhost/api/progress/merge-guest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(withClaim ? { Cookie: `${guestProgressClaimCookie}=${claimToken}` } : {})
    },
    body: JSON.stringify(body)
  });
}

describe("/api/progress/merge-guest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRpc.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: { ok: true, xp: 100, level: 2 }, error: null });
  });

  it("requires authentication", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(request({ lessonIds: ["1"] }));

    expect(response.status).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("returns 409 without a server-issued proof and preserves local progress", async () => {
    const response = await POST(request({ lessonIds: ["1"] }, false));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "guest_proof_missing" });
    expect(mockRpc).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("ignores spoofed lesson ids and redeems only the opaque proof", async () => {
    const response = await POST(request({ lessonIds: ["63", "attacker-controlled"] }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, xp: 100, level: 2 });
    expect(mockRpc).toHaveBeenCalledWith("redeem_guest_progress", {
      p_claim_token: claimToken
    });
    expect(mockRpc).not.toHaveBeenCalledWith(
      "merge_guest_progress",
      expect.objectContaining({ p_lesson_ids: expect.anything() })
    );
  });

  it("clears the proof cookie only after a successful redemption", async () => {
    const response = await POST(request({ lessonIds: ["1"] }));

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${guestProgressClaimCookie}=`);
    expect(setCookie.toLowerCase()).toContain("max-age=0");
    expect(setCookie).toContain(`Path=${guestProgressClaimPath}`);
  });

  it("keeps the proof cookie on a retryable redemption failure", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "guest_proof_expired" }
    });

    const response = await POST(request({ lessonIds: ["1"] }));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "guest_proof_expired" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("does not clear the proof when the RPC returns an invalid result", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    const response = await POST(request({ lessonIds: ["1"] }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "guest_merge_failed" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
