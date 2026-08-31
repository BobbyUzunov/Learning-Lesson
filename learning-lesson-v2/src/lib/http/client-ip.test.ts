import { describe, expect, it } from "vitest";
import { getClientIp, rateLimitBucketFromRequest } from "./client-ip";

describe("client IP helpers", () => {
  it("prefers CDN/proxy headers in order", () => {
    const request = new Request("https://example.com", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-forwarded-for": "198.51.100.2"
      }
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("builds separate buckets per IP", () => {
    const first = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.10" }
    });
    const second = new Request("https://example.com", {
      headers: { "x-forwarded-for": "198.51.100.2" }
    });

    expect(rateLimitBucketFromRequest(first, "auth-signup")).not.toBe(
      rateLimitBucketFromRequest(second, "auth-signup")
    );
  });
});
