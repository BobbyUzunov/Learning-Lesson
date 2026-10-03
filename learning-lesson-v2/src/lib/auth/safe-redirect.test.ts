import { describe, expect, it } from "vitest";
import { DEFAULT_REDIRECT_PATH, resolveRedirectPath, sanitizeRedirectPath } from "./safe-redirect";

describe("sanitizeRedirectPath", () => {
  it("keeps normal local paths with search and hash", () => {
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/classes/abc?tab=work#top")).toBe("/classes/abc?tab=work#top");
    expect(sanitizeRedirectPath("/lesson/1/../2")).toBe("/lesson/2");
  });

  it.each([
    "//evil.example",
    "//evil.example/path",
    "/\\evil.example/path",
    "/\\/evil.example",
    "\\\\evil.example",
    "\\evil.example",
    "/path\\..\\evil",
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    "/\u0000evil",
    "/\u007fevil",
    "/.//evil.example",
    "https://evil.example",
    "javascript:alert(1)",
    "dashboard",
    "",
    "   /dashboard"
  ])("rejects %j", (value) => {
    expect(sanitizeRedirectPath(value)).toBeNull();
  });

  it("rejects non-string values", () => {
    expect(sanitizeRedirectPath(undefined)).toBeNull();
    expect(sanitizeRedirectPath(null)).toBeNull();
    expect(sanitizeRedirectPath(["/dashboard"])).toBeNull();
  });
});

describe("resolveRedirectPath", () => {
  it("returns safe paths and falls back otherwise", () => {
    expect(resolveRedirectPath("/teacher")).toBe("/teacher");
    expect(resolveRedirectPath("/\\evil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
    expect(resolveRedirectPath("//evil", "/classes")).toBe("/classes");
    expect(resolveRedirectPath(undefined)).toBe("/dashboard");
  });
});
