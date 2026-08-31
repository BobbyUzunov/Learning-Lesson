import { describe, expect, it } from "vitest";
import { getPasswordRequirementStatus, isSignupPasswordValid } from "./auth-password";

describe("signup password requirements", () => {
  it("requires length and each character class", () => {
    expect(isSignupPasswordValid("short1!")).toBe(false);
    expect(isSignupPasswordValid("longenough")).toBe(false);
    expect(isSignupPasswordValid("Longenough1")).toBe(false);
    expect(isSignupPasswordValid("Longenough1!")).toBe(true);
  });

  it("tracks each rule independently", () => {
    const status = getPasswordRequirementStatus("Aa1!aaaa");
    expect(status.find((item) => item.id === "length")?.met).toBe(true);
    expect(status.find((item) => item.id === "special")?.met).toBe(true);
    expect(status.every((item) => item.met)).toBe(true);
  });
});
