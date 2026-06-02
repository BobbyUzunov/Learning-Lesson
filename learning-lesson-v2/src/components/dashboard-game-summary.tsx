"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, Target, Trophy } from "lucide-react";
import { ContinueLearningButton } from "./continue-learning-button";
import { getGameProgressStats, getStoredProgress } from "@/lib/game-progress";
import { localizeGameLesson, localizeGameQuest, t, type Language } from "@/lib/i18n";

type DashboardStats = ReturnType<typeof getGameProgressStats>;

export function DashboardGameSummary({ language }: { language: Language }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const copy = t(language);

  useEffect(() => {
    setStats(getGameProgressStats(getStoredProgress()));
  }, []);

  const fallback = stats ?? getGameProgressStats({ completedLessonIds: [], currentStreak: 0, lastCompletedAt: null });
  const currentQuest = localizeGameQuest(fallback.currentQuest, language);
  const currentMission = localizeGameLesson(fallback.currentMission, language);

  return (
    <div className="mt-8 grid gap-4">
      <section className="rounded-lg border border-ink/10 bg-ink p-5 text-paper shadow-soft">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-mint">{copy.dashboard.currentQuest}</p>
            <h2 className="mt-2 text-3xl font-black">{currentQuest.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/75">{currentQuest.description}</p>
          </div>
          <ContinueLearningButton label={copy.dashboard.continueLearning} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
            <Trophy className="size-4" />
            {copy.dashboard.userLevel}
          </div>
          <p className="mt-3 text-4xl font-black">{fallback.level}</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm font-bold text-ink/70">
              <span>{fallback.xpIntoLevel} / {fallback.xpGoal} XP</span>
              <span>{fallback.xpPercent}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-ink/10">
              <div className="h-3 rounded-full bg-mint transition-all" style={{ width: `${fallback.xpPercent}%` }} />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
            <Target className="size-4" />
            {copy.dashboard.currentMission}
          </div>
          <h3 className="mt-3 text-2xl font-black">{currentMission.title}</h3>
          <Link className="mt-4 inline-flex rounded-md bg-ink px-3 py-2 text-sm font-bold text-paper" href={`/lesson/${fallback.currentMission.id}`}>
            {copy.dashboard.openMission}
          </Link>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
            <Flame className="size-4" />
            {copy.dashboard.currentStreak}
          </div>
          <p className="mt-3 text-4xl font-black">{fallback.currentStreak}</p>
          <p className="mt-2 text-sm text-ink/70">{copy.dashboard.lessonsCompleted}: {fallback.completedCount}</p>
          <p className="mt-1 text-sm text-ink/70">{copy.dashboard.totalXp}: {fallback.xp}</p>
        </div>
      </section>
    </div>
  );
}
