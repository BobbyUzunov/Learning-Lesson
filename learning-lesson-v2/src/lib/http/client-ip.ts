import { createHash } from "node:crypto";

/** Best-effort client IP for rate limiting behind Vercel/proxies. */
export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function hashClientIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}
