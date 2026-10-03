export const DEFAULT_REDIRECT_PATH = "/dashboard";

// Only used to resolve relative input; the host is never returned to callers.
const BASE_ORIGIN = "https://redirect-base.invalid";

// Control characters (incl. tab/CR/LF, which URL parsers silently strip) and DEL.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * Returns a same-origin `pathname + search + hash` for a user-supplied redirect,
 * or `null` when the value could navigate off-site.
 *
 * Rejects backslashes (browsers treat `\` as `/`, so `/\evil.example` becomes
 * protocol-relative), control characters, non-path values and `//host` forms,
 * then resolves against a base origin and requires the origin to be unchanged.
 */
export function sanitizeRedirectPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  if (value.includes("\\") || CONTROL_CHARS.test(value)) {
    return null;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  let resolved: URL;
  try {
    resolved = new URL(value, BASE_ORIGIN);
  } catch {
    return null;
  }

  if (resolved.origin !== BASE_ORIGIN) {
    return null;
  }

  const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
  // Dot-segment normalisation can turn `/.//evil` into `//evil`.
  if (!path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  return path;
}

export function resolveRedirectPath(value: unknown, fallback: string = DEFAULT_REDIRECT_PATH): string {
  return sanitizeRedirectPath(value) ?? fallback;
}
