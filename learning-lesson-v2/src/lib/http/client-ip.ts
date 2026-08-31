import { createHash } from "node:crypto";

const IP_HEADER_CANDIDATES = [
  "cf-connecting-ip",
  "x-vercel-forwarded-for",
  "x-real-ip",
  "x-forwarded-for"
] as const;

/** Best-effort client IP for rate limiting behind Vercel/CDN proxies. */
export function getClientIp(request: Request) {
  for (const headerName of IP_HEADER_CANDIDATES) {
    const value = request.headers.get(headerName);
    if (!value) {
      continue;
    }

    const first = value.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return null;
}

export function hashClientIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

/** Build a per-client rate-limit bucket. Falls back to a request-scoped key when IP is missing. */
export function rateLimitBucketFromRequest(request: Request, prefix: string) {
  const ip = getClientIp(request);
  if (ip) {
    return `${prefix}:${hashClientIp(ip)}`;
  }

  const requestId = request.headers.get("x-vercel-id")?.trim();
  if (requestId) {
    return `${prefix}:req:${hashClientIp(requestId)}`;
  }

  return `${prefix}:anon:${hashClientIp(request.headers.get("user-agent") ?? "unknown")}`;
}
