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
