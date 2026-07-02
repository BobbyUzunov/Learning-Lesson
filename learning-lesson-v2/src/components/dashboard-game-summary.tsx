"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, Flame, Gift, Target, Trophy } from "lucide-react";
import { ContinueLearningButton } from "./continue-learning-button";
import { DailyStreakCard } from "./daily-streak-card";
import { getAchievements, getGameProgressStats, getStoredProgress, toGameProgress } from "@/lib/game-progress";
import { localizeGameLesson, localizeGameQuest, t, type Language } from "@/lib/i18n";
import type { ProgressRecord } from "@/lib/types";

type DashboardStats = ReturnType<typeof getGameProgressStats>;

export function DashboardGameSummary({
  initialProgress,
  language
}: {
  initialProgress?: ProgressRecord[];
  language: Language;
}) {
  const initialStats = initialProgress ? getGameProgressStats(toGameProgress(initialProgress)) : null;
  const [stats, setStats] = useState<DashboardStats | null>(initialStats);
  const copy = t(language);

  useEffect(() => {
    if (!initialProgress) {
      setStats(getGameProgressStats(getStoredProgress()));
    }
  }, [initialProgress]);

  const fallback = stats ?? getGameProgressStats({ completedLessonIds: [], currentStreak: 0, lastCompletedAt: null });
  const currentQuest = localizeGameQuest(fallback.currentQuest, language);
  const currentMission = localizeGameLesson(fallback.currentMission, language);
  const completedLessonIds = initialProgress?.filter((item) => item.completed).map((item) => item.lesson_id);
  const hasProgress = fallback.completedCount > 0;
  const continueLabel = hasProgress ? copy.dashboard.continueLearning : copy.dashboard.startJourney;
  const recentAchievements = getAchievements({
    completedLessonIds: completedLessonIds ?? [],
    currentStreak: fallback.currentStreak,
    lastCompletedAt: null
  }).filter((achievement) => achievement.unlocked).slice(0, 3);

  return (
    <div className="mt-8 grid gap-5">
      <section className="rounded-lg border border-ink/10 bg-ink p-5 text-paper shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-mint">
              {hasProgress ? copy.dashboard.continueLearning : continueLabel}
            </p>
            <h2 className="mt-2 text-3xl font-black">{currentQuest.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/75">{currentQuest.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-paper/10 bg-paper/10 p-4">
                <p className="text-xs font-bold uppercase text-paper/55">{copy.dashboard.currentQuest}</p>
                <p className="mt-2 text-lg font-black">{currentQuest.title}</p>
              </div>
              <div className="rounded-lg border border-paper/10 bg-paper/10 p-4">
                <p className="text-xs font-bold uppercase text-paper/55">{copy.dashboard.currentMission}</p>
                <p className="mt-2 text-lg font-black">{currentMission.title}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm font-bold text-paper/75">
                <span>{copy.dashboard.progress}</span>
                <span>{fallback.xpPercent}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-paper/15">
                <div className="h-3 rounded-full bg-mint transition-all" style={{ width: `${fallback.xpPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-paper/10 bg-paper/10 p-4">
            <p className="text-sm font-bold text-paper/65">{copy.dashboard.lessonsCompleted}: {fallback.completedCount}</p>
            <p className="mt-2 text-sm text-paper/65">{fallback.xpIntoLevel} / {fallback.xpGoal} XP</p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-paper/10 px-2 py-1 text-xs font-bold text-mint">
              <Gift className="size-4" />
              {copy.dashboard.nextReward}: {fallback.nextReward}
            </p>
            <ContinueLearningButton
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-mint px-5 py-4 text-center text-lg font-black text-ink transition hover:-translate-y-0.5 hover:bg-mint/80"
              completedLessonIds={completedLessonIds}
              label={continueLabel}
            />
          </div>
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

      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <DailyStreakCard language={language} />
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
            <Award className="size-4 text-coral" />
            {copy.dashboard.recentAchievements}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(recentAchievements.length ? recentAchievements : getAchievements({
              completedLessonIds: [],
              currentStreak: 0,
              lastCompletedAt: null
            }).slice(0, 3)).map((achievement) => (
              <div
                className={`rounded-lg border p-3 ${
                  achievement.unlocked ? "border-mint/30 bg-mint/15" : "border-ink/10 bg-ink/5 text-ink/45"
                }`}
                key={achievement.id}
              >
                <p className="text-sm font-black">{achievement.title}</p>
                <p className="mt-1 text-xs leading-5">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
