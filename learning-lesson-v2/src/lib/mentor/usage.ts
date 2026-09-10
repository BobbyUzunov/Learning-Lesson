/** Missing or malformed response metadata must never become an exhausted quota. */
export function parseMentorRemainingHeader(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value.trim())) {
    return null;
  }

  const remaining = Number(value.trim());
  return Number.isSafeInteger(remaining) ? remaining : null;
}

export function parseMentorDailyLimit(value: string | undefined, fallback = 5) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function computeMentorRemaining(count: number, limit: number) {
  return Math.max(limit - count, 0);
}

export function isMentorLimitReached(count: number, limit: number) {
  return count >= limit;
}
