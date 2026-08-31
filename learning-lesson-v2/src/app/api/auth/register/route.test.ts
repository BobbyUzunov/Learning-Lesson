import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  signUp: vi.fn(),
  hasSupabaseEnv: vi.fn(() => true),
  hasSupabaseAdminEnv: vi.fn(() => true)
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/admin-env", () => ({ hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: { admin: { createUser: mocks.createUser } }
  }))
}));
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
    mocks.createUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "student@school.bg" } },
      error: null
    });
    mocks.signUp.mockResolvedValue({
      data: { user: { id: "user-1", email: "student@school.bg" }, session: null },
      error: null
    });
  });

  it("creates users through the admin API when service role is configured", async () => {
    const response = await POST(request(validSignup));

    expect(response.status).toBe(200);
    expect(mocks.createUser).toHaveBeenCalledWith({
      email: "student@school.bg",
      password: "Secret1!",
      email_confirm: false,
      user_metadata: expect.objectContaining({
        display_name: "Student",
        intended_role: "user",
        grade_level: 8
      })
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      ok: true,
      needsEmailConfirmation: true,
      user: { id: "user-1", email: "student@school.bg" }
    });
  });

  it("falls back to public signUp when admin credentials are missing", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);

    const response = await POST(request(validSignup));

    expect(response.status).toBe(200);
    expect(mocks.createUser).not.toHaveBeenCalled();
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
    expect(mocks.createUser).not.toHaveBeenCalled();
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
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
});
