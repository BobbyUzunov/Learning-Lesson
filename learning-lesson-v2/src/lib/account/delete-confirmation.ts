export const ACCOUNT_DELETE_PHRASES = ["DELETE", "ИЗТРИЙ"] as const;

export function isAccountDeletePhrase(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toUpperCase();
  return (ACCOUNT_DELETE_PHRASES as readonly string[]).includes(normalized);
}
