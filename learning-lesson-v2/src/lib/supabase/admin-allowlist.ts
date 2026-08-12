/** Optional comma-separated admin emails. Empty = role=admin is enough. */
export function parseAdminEmailAllowlist(value: string | undefined = process.env.ADMIN_EMAIL_ALLOWLIST) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmailAllowed(
  email: string | null | undefined,
  allowlist: string[] = parseAdminEmailAllowlist()
) {
  if (allowlist.length === 0) {
    return true;
  }

  const normalized = email?.trim().toLowerCase() ?? "";
  return Boolean(normalized) && allowlist.includes(normalized);
}
