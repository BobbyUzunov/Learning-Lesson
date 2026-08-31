import { describe, expect, it } from "vitest";
import { mapAuthErrorMessage, type AuthErrorLabels } from "./auth-error";

const labels: AuthErrorLabels = {
  passwordPolicy: "friendly-password-policy",
  passwordTooShort: "friendly-password-too-short",
  alreadyRegistered: "friendly-already-registered",
  invalidCredentials: "friendly-invalid-credentials",
  emailNotConfirmed: "friendly-email-not-confirmed",
  invalidEmail: "friendly-invalid-email",
  rateLimited: "friendly-rate-limited",
  passwordSameAsOld: "friendly-password-same-as-old"
};

describe("mapAuthErrorMessage", () => {
  it("replaces the Supabase character-class dump with a friendly password policy message", () => {
    const raw =
      "Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%^&*()_+-=[]{};':\"\\|<>?,./`~";

    expect(mapAuthErrorMessage(raw, labels)).toBe("friendly-password-policy");
  });

  it("maps other common Auth errors without exposing raw server text", () => {
    expect(mapAuthErrorMessage("Password should be at least 6 characters", labels)).toBe(
      "friendly-password-too-short"
    );
    expect(mapAuthErrorMessage("User already registered", labels)).toBe("friendly-already-registered");
    expect(mapAuthErrorMessage("Invalid login credentials", labels)).toBe("friendly-invalid-credentials");
    expect(mapAuthErrorMessage("Email not confirmed", labels)).toBe("friendly-email-not-confirmed");
    expect(mapAuthErrorMessage("Unable to validate email address: invalid format", labels)).toBe(
      "friendly-invalid-email"
    );
    expect(
      mapAuthErrorMessage("For security purposes, you can only request this after 60 seconds.", labels)
    ).toBe("friendly-rate-limited");
    expect(mapAuthErrorMessage("email rate limit exceeded", labels)).toBe("friendly-rate-limited");
    expect(mapAuthErrorMessage("over_email_send_rate_limit", labels)).toBe("friendly-rate-limited");
    expect(mapAuthErrorMessage("Request rate limit reached", labels)).toBe("friendly-rate-limited");
    expect(mapAuthErrorMessage("New password should be different from the old password.", labels)).toBe(
      "friendly-password-same-as-old"
    );
  });

  it("keeps unrecognized messages as-is", () => {
    expect(mapAuthErrorMessage("Something unexpected happened", labels)).toBe("Something unexpected happened");
  });
});
