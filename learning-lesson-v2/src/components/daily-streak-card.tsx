"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { formatMessage, formatStreakDays, t, type Language } from "@/lib/i18n";

type StreakState = {
  count: number;
  lastVisit: string | null;
};

const streakKey = "learning-lesson-v2-daily-streak";

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getYesterdayKey(date: Date) {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return toDateKey(yesterday);
}

function getLocalStreak(): StreakState {
  const today = toDateKey(new Date());
  const yesterday = getYesterdayKey(new Date());
  const raw = window.localStorage.getItem(streakKey);
  let previous: StreakState = { count: 0, lastVisit: null };
  try {
    previous = raw ? (JSON.parse(raw) as StreakState) : previous;
  } catch {
    previous = { count: 0, lastVisit: null };
  }

  return previous.lastVisit === today
    ? previous
    : {
        count: previous.lastVisit === yesterday ? previous.count + 1 : 1,
        lastVisit: today
      };
}

export function DailyStreakCard({
  compact = false,
  initialStreak = 0,
  isAuthenticated = false,
  language = "en"
}: {
  compact?: boolean;
  initialStreak?: number;
  isAuthenticated?: boolean;
  language?: Language;
}) {
  const [streak, setStreak] = useState<StreakState>({ count: initialStreak || 1, lastVisit: null });
  const copy = t(language);

  useEffect(() => {
    async function syncStreak() {
      if (isAuthenticated) {
        const response = await fetch("/api/streak", { method: "POST" });
        if (response.ok) {
          const result = (await response.json()) as { streak?: number };
          setStreak({ count: result.streak ?? 1, lastVisit: toDateKey(new Date()) });
          return;
        }
      }

      const next = getLocalStreak();
      window.localStorage.setItem(streakKey, JSON.stringify(next));
      setStreak(next);
    }

    void syncStreak();
  }, [isAuthenticated]);

  const milestones = [1, 7, 30];

  return (
    <section className={compact ? "" : "rounded-lg border border-ink/10 bg-white/80 p-4 shadow-sm"}>
      <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
        <Flame className="size-4 text-coral" />
        {copy.streak.title}
      </div>
      <p className="mt-2 text-3xl font-black">🔥 {formatStreakDays(language, streak.count)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {milestones.map((days) => (
          <span
            className={`rounded-md px-2 py-1 text-xs font-bold ${
              streak.count >= days ? "bg-mint/20 text-ink" : "bg-ink/5 text-ink/45"
            }`}
            key={days}
          >
            🔥 {formatMessage(copy.streak.milestone, { count: days })}
          </span>
        ))}
      </div>
    </section>
  );
}
