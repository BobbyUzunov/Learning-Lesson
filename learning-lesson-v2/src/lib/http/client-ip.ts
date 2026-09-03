import { createHash } from "node:crypto";

function readFirstIp(value: string | null) {
  const first = value?.split(",")[0]?.trim();
  return first || null;
}

function isVercelRuntime() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV?.trim());
}

/** Opt-in when Cloudflare terminates TLS in front of the app and sets cf-connecting-ip. */
function trustCloudflareConnectingIp() {
  return process.env.TRUST_CF_CONNECTING_IP === "1";
}

/**
 * Best-effort client IP for rate limiting.
 * On Vercel, only trust x-vercel-forwarded-for (platform-controlled).
 * Never trust client-supplied cf-connecting-ip unless TRUST_CF_CONNECTING_IP=1.
 */
export function getClientIp(request: Request) {
  if (isVercelRuntime()) {
    const vercelIp = readFirstIp(request.headers.get("x-vercel-forwarded-for"));
    if (vercelIp) {
      return vercelIp;
    }

    if (trustCloudflareConnectingIp()) {
      return readFirstIp(request.headers.get("cf-connecting-ip"));
    }

    return null;
  }

  if (trustCloudflareConnectingIp()) {
    const cloudflareIp = readFirstIp(request.headers.get("cf-connecting-ip"));
    if (cloudflareIp) {
      return cloudflareIp;
    }
  }

  for (const headerName of ["x-real-ip", "x-forwarded-for"] as const) {
    const ip = readFirstIp(request.headers.get(headerName));
    if (ip) {
      return ip;
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
