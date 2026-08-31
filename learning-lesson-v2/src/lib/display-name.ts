export const DISPLAY_NAME_MAX_LENGTH = 80;

/** Characters that must never appear in a human display name. */
const UNSAFE_DISPLAY_NAME_PATTERN = /[<>&\\`{}]|javascript:/i;

/** ASCII and Unicode control characters (except common whitespace). */
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

export function isValidDisplayName(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return false;
  }

  if (UNSAFE_DISPLAY_NAME_PATTERN.test(trimmed) || CONTROL_CHAR_PATTERN.test(trimmed)) {
    return false;
  }

  return true;
}

/** Returns a safe display name or null when the input is empty or unsafe. */
export function sanitizeDisplayName(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || !isValidDisplayName(trimmed)) {
    return null;
  }

  return trimmed;
}
