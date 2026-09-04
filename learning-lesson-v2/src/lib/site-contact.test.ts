import { afterEach, describe, expect, it, vi } from "vitest";
import { getContactEmail, getContactMailto, getOperatorName } from "./site-contact";

describe("site-contact", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses env contact email when set", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", " ops@school.bg ");
    expect(getContactEmail()).toBe("ops@school.bg");
    expect(getContactMailto("Hello")).toBe("mailto:ops@school.bg?subject=Hello");
  });

  it("falls back to pilot defaults", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_NAME", "");
    expect(getContactEmail()).toBe("pilot@learninglesson.app");
    expect(getOperatorName("bg")).toContain("пилотен");
    expect(getOperatorName("en")).toContain("pilot");
  });
});
