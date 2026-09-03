import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  registerUserWithAdmin: vi.fn(),
  signUp: vi.fn(),
  hasSupabaseEnv: vi.fn(() => true),
  hasSupabaseAdminEnv: vi.fn(() => true),
  consumeRateLimit: vi.fn(async (): Promise<"allowed" | "limited" | "unavailable"> => "allowed"),
  logServerError: vi.fn()
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/admin-env", () => ({ hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({}))
}));
vi.mock("@/lib/auth/register-user", () => ({
  registerUserWithAdmin: mocks.registerUserWithAdmin,
  isDuplicateSignupError: (message: string) => /already been registered|already registered|user already registered/i.test(message)
}));
vi.mock("@/lib/observability", () => ({ logServerError: mocks.logServerError }));
vi.mock("@/lib/http/rate-limit", () => ({ consumeRateLimit: mocks.consumeRateLimit }));
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

const validSignup = {
  email: "student@school.bg",
  password: "Secret1!",
  displayName: "Student",
  accountRole: "user",
  acceptedPrivacy: true
} as const;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.consumeRateLimit.mockResolvedValue("allowed");
    mocks.registerUserWithAdmin.mockResolvedValue({
      user: { id: "user-1", email: "student@school.bg" },
      needsEmailConfirmation: true,
      resendError: null
    });
    mocks.signUp.mockResolvedValue({
      data: { user: { id: "user-1", email: "student@school.bg" }, session: null },
      error: null
    });
  });

  it("returns a generic confirmation response without leaking user identity", async () => {
    const response = await POST(request(validSignup));

    expect(response.status).toBe(200);
    expect(mocks.registerUserWithAdmin).toHaveBeenCalled();
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      ok: true,
      needsEmailConfirmation: true
    });
  });

  it("logs admin signup failures without leaking the raw message to the client", async () => {
    mocks.registerUserWithAdmin.mockResolvedValue({
      user: null,
      needsEmailConfirmation: false,
      error: "Request rate limit reached",
      errorCode: "signup_failed"
    });

    const response = await POST(request(validSignup));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "signup_failed" });
    expect(mocks.logServerError).toHaveBeenCalledWith("signup_failed", {
      channel: "admin",
      detail: "Request rate limit reached"
    });
  });

  it("does not reveal when an email is already registered", async () => {
    mocks.registerUserWithAdmin.mockResolvedValue({
      user: null,
      needsEmailConfirmation: true,
      resendError: null
    });

    const response = await POST(request(validSignup));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      needsEmailConfirmation: true
    });
    expect(mocks.logServerError).not.toHaveBeenCalled();
  });

  it("falls back to public signUp when admin credentials are missing", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);

    const response = await POST(request(validSignup));

    expect(response.status).toBe(200);
    expect(mocks.registerUserWithAdmin).not.toHaveBeenCalled();
    expect(mocks.signUp).toHaveBeenCalled();
    expect(await response.json()).toEqual({
      ok: true,
      needsEmailConfirmation: true
    });
  });

  it("requires privacy consent", async () => {
    const response = await POST(
      request({
        ...validSignup,
        acceptedPrivacy: false
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "privacy_consent_required" });
    expect(mocks.registerUserWithAdmin).not.toHaveBeenCalled();
  });

  it("rejects weak passwords before calling Supabase", async () => {
    const response = await POST(
      request({
        ...validSignup,
        password: "short"
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_password" });
    expect(mocks.registerUserWithAdmin).not.toHaveBeenCalled();
  });

  it("rejects unsafe display names before calling Supabase", async () => {
    const response = await POST(
      request({
        ...validSignup,
        displayName: "<img src=x onerror=alert(1)>"
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_display_name" });
    expect(mocks.registerUserWithAdmin).not.toHaveBeenCalled();
  });

  it("returns signup_rate_limited when a bucket is exhausted", async () => {
    mocks.consumeRateLimit.mockResolvedValueOnce("allowed").mockResolvedValueOnce("limited");

    const response = await POST(request(validSignup));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "signup_rate_limited" });
    expect(mocks.registerUserWithAdmin).not.toHaveBeenCalled();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("returns signup_unavailable when the rate limiter backend fails", async () => {
    mocks.consumeRateLimit.mockResolvedValue("unavailable");

    const response = await POST(request(validSignup));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "signup_unavailable" });
    expect(mocks.registerUserWithAdmin).not.toHaveBeenCalled();
  });
});
