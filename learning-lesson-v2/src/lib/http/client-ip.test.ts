import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientIp, rateLimitBucketFromRequest } from "./client-ip";

describe("client IP helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("on Vercel trusts only x-vercel-forwarded-for and ignores spoofed cf-connecting-ip", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("TRUST_CF_CONNECTING_IP", "");

    const request = new Request("https://example.com", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-vercel-forwarded-for": "198.51.100.2",
        "x-forwarded-for": "192.0.2.1"
      }
    });

    expect(getClientIp(request)).toBe("198.51.100.2");
  });

  it("on Vercel does not fall back to client-supplied Cloudflare headers", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("TRUST_CF_CONNECTING_IP", "");

    const request = new Request("https://example.com", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-forwarded-for": "192.0.2.1"
      }
    });

    expect(getClientIp(request)).toBeNull();
  });

  it("uses cf-connecting-ip on Vercel only when TRUST_CF_CONNECTING_IP=1 and Vercel header is missing", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("TRUST_CF_CONNECTING_IP", "1");

    const request = new Request("https://example.com", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-forwarded-for": "192.0.2.1"
      }
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("outside Vercel prefers x-real-ip / x-forwarded-for over untrusted cf-connecting-ip", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("TRUST_CF_CONNECTING_IP", "");

    const request = new Request("https://example.com", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-forwarded-for": "198.51.100.2"
      }
    });

    expect(getClientIp(request)).toBe("198.51.100.2");
  });

  it("builds separate buckets per IP", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");

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
