import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  hasSupabaseEnv: vi.fn(() => true)
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signUp: mocks.signUp }
  }))
}));

function request(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.signUp.mockResolvedValue({
      data: { user: { id: "user-1", email: "student@school.bg" }, session: null },
      error: null
    });
  });

  it("requires privacy consent", async () => {
    const response = await POST(
      request({
        email: "student@school.bg",
        password: "Secret1!",
        displayName: "Student",
        accountRole: "user",
        acceptedPrivacy: false
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "privacy_consent_required" });
  });

  it("rejects weak passwords before calling Supabase", async () => {
    const response = await POST(
      request({
        email: "student@school.bg",
        password: "short",
        displayName: "Student",
        accountRole: "user",
        acceptedPrivacy: true
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_password" });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
});
