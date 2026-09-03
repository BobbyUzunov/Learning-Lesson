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
    const updateUserById = vi.fn();
    const listUsers = vi.fn();
    const resend = vi.fn().mockResolvedValue({ error: null });
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "User already registered" }
          }),
          listUsers,
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
    expect(listUsers).not.toHaveBeenCalled();
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

  it("returns the same generic confirmation shape for a confirmed duplicate email", async () => {
    const listUsers = vi.fn();
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "User already registered" }
          }),
          listUsers,
          updateUserById: vi.fn()
        },
        resend: vi.fn().mockResolvedValue({ error: { message: "Email already confirmed" } })
      }
    };

    const result = await registerUserWithAdmin(admin as never, {
      email: "student@school.bg",
      password: "Secret1!",
      metadata: {},
      redirectTo: "https://example.com/auth/callback"
    });

    expect(listUsers).not.toHaveBeenCalled();
    expect(result).toEqual({
      user: null,
      needsEmailConfirmation: true,
      resendError: "Email already confirmed"
    });
    expect(result.errorCode).toBeUndefined();
  });
});
