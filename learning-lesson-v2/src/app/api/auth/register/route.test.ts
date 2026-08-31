import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  registerUserWithAdmin: vi.fn(),
  signUp: vi.fn(),
  hasSupabaseEnv: vi.fn(() => true),
  hasSupabaseAdminEnv: vi.fn(() => true),
  logServerError: vi.fn()
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/admin-env", () => ({ hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({}))
}));
vi.mock("@/lib/auth/register-user", () => ({
  registerUserWithAdmin: mocks.registerUserWithAdmin
}));
vi.mock("@/lib/observability", () => ({ logServerError: mocks.logServerError }));
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

  it("registers through the admin helper when service role is configured", async () => {
    const response = await POST(request(validSignup));

    expect(response.status).toBe(200);
    expect(mocks.registerUserWithAdmin).toHaveBeenCalled();
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      ok: true,
      needsEmailConfirmation: true,
      user: { id: "user-1", email: "student@school.bg" }
    });
  });

  it("logs admin signup failures", async () => {
    mocks.registerUserWithAdmin.mockResolvedValue({
      user: null,
      needsEmailConfirmation: false,
      error: "Request rate limit reached"
    });

    const response = await POST(request(validSignup));

    expect(response.status).toBe(400);
    expect(mocks.logServerError).toHaveBeenCalledWith("signup_failed", {
      channel: "admin",
      detail: "Request rate limit reached"
    });
  });

  it("falls back to public signUp when admin credentials are missing", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);

    const response = await POST(request(validSignup));

    expect(response.status).toBe(200);
    expect(mocks.registerUserWithAdmin).not.toHaveBeenCalled();
    expect(mocks.signUp).toHaveBeenCalled();
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
});
