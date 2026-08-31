/** Optional comma-separated admin emails. Required in production — see isAdminAllowlistRequired(). */
export function parseAdminEmailAllowlist(value: string | undefined = process.env.ADMIN_EMAIL_ALLOWLIST) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminAllowlistRequired() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

export function isAdminEmailAllowed(
  email: string | null | undefined,
  allowlist: string[] = parseAdminEmailAllowlist()
) {
  if (allowlist.length === 0) {
    return !isAdminAllowlistRequired();
  }

  const normalized = email?.trim().toLowerCase() ?? "";
  return Boolean(normalized) && allowlist.includes(normalized);
}
