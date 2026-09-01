import { describe, expect, it, vi } from "vitest";
import { isDuplicateSignupError, registerUserWithAdmin } from "./register-user";

describe("register user helpers", () => {
  it("detects duplicate signup errors from Supabase", () => {
    expect(isDuplicateSignupError("User already registered")).toBe(true);
    expect(isDuplicateSignupError("A user with this email address has already been registered")).toBe(
      true
    );
    expect(isDuplicateSignupError("Request rate limit reached")).toBe(false);
  });
});

describe("registerUserWithAdmin", () => {
  it("does not overwrite the password of an unconfirmed duplicate account", async () => {
    const existing = {
      id: "user-1",
      email: "student@school.bg",
      email_confirmed_at: null,
      user_metadata: { display_name: "Original" }
    };
    const updateUserById = vi.fn();
    const resend = vi.fn().mockResolvedValue({ error: null });
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "User already registered" }
          }),
          listUsers: vi.fn().mockResolvedValue({ data: { users: [existing] }, error: null }),
          updateUserById
        },
        resend
      }
    };

    const result = await registerUserWithAdmin(admin as never, {
      email: "student@school.bg",
      password: "Attacker1!",
      metadata: { display_name: "Attacker" },
      redirectTo: "https://example.com/auth/callback"
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(resend).toHaveBeenCalledWith({
      type: "signup",
      email: "student@school.bg",
      options: { emailRedirectTo: "https://example.com/auth/callback" }
    });
    expect(result).toEqual({
      user: null,
      needsEmailConfirmation: true,
      resendError: null
    });
  });

  it("returns already_registered when the email is confirmed", async () => {
    const existing = {
      id: "user-1",
      email: "student@school.bg",
      email_confirmed_at: "2026-08-01T00:00:00Z",
      user_metadata: {}
    };
    const updateUserById = vi.fn();
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "User already registered" }
          }),
          listUsers: vi.fn().mockResolvedValue({ data: { users: [existing] }, error: null }),
          updateUserById
        },
        resend: vi.fn()
      }
    };

    const result = await registerUserWithAdmin(admin as never, {
      email: "student@school.bg",
      password: "Secret1!",
      metadata: {},
      redirectTo: "https://example.com/auth/callback"
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(result.errorCode).toBe("already_registered");
    expect(result.user).toBeNull();
  });
});
