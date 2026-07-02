"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getDailyChallengeStatus } from "@/lib/daily-challenge";
import { gameLessons } from "@/lib/game-data";
import { localizeGameLesson, t, type Language } from "@/lib/i18n";
import type { ProgressRecord } from "@/lib/types";

export function DailyChallengeCard({
  initialProgress = [],
  isAuthenticated = false,
  language
}: {
  initialProgress?: ProgressRecord[];
  isAuthenticated?: boolean;
  language: Language;
}) {
  const copy = t(language);
  const [status, setStatus] = useState(() => getDailyChallengeStatus(initialProgress));
  const lesson = gameLessons.find((item) => item.id === status.lessonId);
  const localizedLesson = lesson ? localizeGameLesson(lesson, language) : null;

  useEffect(() => {
    async function syncChallenge() {
      if (!isAuthenticated) {
        setStatus(getDailyChallengeStatus(initialProgress));
        return;
      }

      const response = await fetch("/api/daily-challenge");
      if (response.ok) {
        const result = (await response.json()) as { lessonId: string; completed: boolean; dateKey: string };
        setStatus(result);
      }
    }

    void syncChallenge();
  }, [initialProgress, isAuthenticated]);

  if (!localizedLesson) {
    return null;
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
        <Sparkles className="size-4 text-violet" />
        {copy.dailyChallenge.title}
      </div>
      <p className="mt-2 text-sm text-ink/70">{copy.dailyChallenge.subtitle}</p>
      <h3 className="mt-3 text-2xl font-black">{localizedLesson.title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">{localizedLesson.mission}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {status.completed ? (
          <span className="inline-flex rounded-md bg-mint/20 px-3 py-2 text-sm font-bold text-ink">
            {copy.dailyChallenge.completed}
          </span>
        ) : (
          <Link
            className="inline-flex rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90"
            href={`/lesson/${status.lessonId}`}
          >
            {copy.dailyChallenge.start}
          </Link>
        )}
        <span className="text-xs font-bold uppercase text-ink/45">{status.dateKey}</span>
      </div>
    </section>
  );
}
