import { describe, expect, it } from "vitest";
import { isDuplicateSignupError } from "./register-user";

describe("register user helpers", () => {
  it("detects duplicate signup errors from Supabase", () => {
    expect(isDuplicateSignupError("User already registered")).toBe(true);
    expect(isDuplicateSignupError("A user with this email address has already been registered")).toBe(
      true
    );
    expect(isDuplicateSignupError("Request rate limit reached")).toBe(false);
  });
});
