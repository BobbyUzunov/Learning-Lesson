type UsageRecord = {
  count: number;
  date: string;
};

const usageByUser = new Map<string, UsageRecord>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getMentorUsage(userId: string) {
  const today = todayKey();
  const record = usageByUser.get(userId);
  if (!record || record.date !== today) {
    return { count: 0, remaining: 0, limit: 0 };
  }

  return record;
}

export function checkMentorRateLimit(userId: string, limit: number) {
  const today = todayKey();
  const record = usageByUser.get(userId);
  const count = record?.date === today ? record.count : 0;

  if (count >= limit) {
    return { ok: false as const, remaining: 0, limit };
  }

  usageByUser.set(userId, { count: count + 1, date: today });
  return { ok: true as const, remaining: limit - count - 1, limit };
}

export function resetMentorRateLimitForTests() {
  usageByUser.clear();
}
