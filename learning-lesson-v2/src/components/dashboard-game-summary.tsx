"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Clock3, Rocket, Route } from "lucide-react";
import { ContinueLearningButton } from "./continue-learning-button";
import { getGameProgressStats, getStoredProgress, toGameProgress } from "@/lib/game-progress";
import { gameLessons } from "@/lib/game-data";
import type { GameLesson } from "@/lib/game-data";
import { formatMessage, formatLessonsProgress, localizeGameLesson, localizeGameQuest, t, type Language } from "@/lib/i18n";
import { getLessonModuleIndex } from "@/lib/lesson-structure";
import { resolveLessonMetadata } from "@/lib/lesson-metadata/generate";
import { getNextPendingProject, localizeProject } from "@/lib/projects";
import type { ProgressRecord } from "@/lib/types";

type DashboardStats = ReturnType<typeof getGameProgressStats>;

export function DashboardGameSummary({
  initialLessons,
  initialProgress,
  initialStreak = 0,
  submittedProjectIds = [],
  language
}: {
  initialLessons?: GameLesson[];
  initialProgress?: ProgressRecord[];
  initialStreak?: number;
  submittedProjectIds?: string[];
  language: Language;
}) {
  const lessons = initialLessons ?? gameLessons;
  const initialStats = initialProgress
    ? getGameProgressStats(toGameProgress(initialProgress, initialStreak), lessons)
    : null;
  const [stats, setStats] = useState<DashboardStats | null>(initialStats);
  const copy = t(language);

  useEffect(() => {
    if (!initialProgress) {
      setStats(getGameProgressStats(getStoredProgress(), lessons));
    }
  }, [initialProgress, lessons]);

  const fallback = stats ?? getGameProgressStats({ completedLessonIds: [], currentStreak: 0, lastCompletedAt: null }, lessons);
  const currentQuest = localizeGameQuest(fallback.currentQuest, language);
  const currentLesson = localizeGameLesson(fallback.currentMission, language);
  const completedLessonIds = initialProgress?.filter((item) => item.completed).map((item) => item.lesson_id) ?? [];
  const hasProgress = fallback.completedCount > 0;
  const pendingProject = getNextPendingProject(completedLessonIds, submittedProjectIds);
  const localizedPendingProject = pendingProject ? localizeProject(pendingProject, language) : null;
  const moduleNumber = getLessonModuleIndex(fallback.currentMission.id, fallback.currentQuest.id);
  const metadata = resolveLessonMetadata(
    fallback.currentMission,
    fallback.currentQuest,
    moduleNumber
  );
  const readingTime = language === "bg" ? metadata.readingTimeMinutes : metadata.readingTimeMinutes;

  return (
    <div className="mt-8 grid gap-5">
      <section className="overflow-hidden rounded-lg border border-ink/10 bg-white/90 shadow-soft">
        <div className="border-b border-ink/10 bg-mint/10 px-6 py-4">
          <p className="text-sm font-bold uppercase text-violet">
            {hasProgress ? copy.dashboard.continueLearning : copy.dashboard.startJourney}
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-ink/55">
              <span className="inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-1">
                <Route className="size-3.5 text-violet" />
                {currentQuest.title}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-1">
                <BookOpen className="size-3.5 text-violet" />
                {formatMessage(copy.syllabus.moduleLabel, {
                  current: moduleNumber,
                  total: fallback.courseTotal
                })}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-1">
                <Clock3 className="size-3.5 text-violet" />
                {readingTime} {copy.syllabus.readingTime}
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-black">{currentLesson.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{currentQuest.description}</p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm font-bold text-ink/70">
                <span>{copy.dashboard.courseProgress}</span>
                <span>
                  {formatLessonsProgress(language, fallback.courseCompleted, fallback.courseTotal)} · {fallback.coursePercent}%
                </span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-ink/10">
                <div className="h-3 rounded-full bg-violet transition-all" style={{ width: `${fallback.coursePercent}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-ink/[0.03] p-5">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.nextStep}</p>
            <p className="mt-2 text-lg font-black">{hasProgress ? copy.dashboard.resumeLesson : copy.dashboard.openFirstLesson}</p>
            <ContinueLearningButton
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-4 text-center text-lg font-black text-paper transition hover:bg-ink/90"
              completedLessonIds={completedLessonIds}
              label={hasProgress ? copy.dashboard.continueLesson : copy.dashboard.startFirstLesson}
            />
            <Link
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink/15 px-4 py-3 text-sm font-bold text-ink transition hover:bg-white"
              href="/paths"
            >
              {copy.dashboard.browseCourses}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              className="mt-3 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-bold text-ink/60 transition hover:text-ink"
              href="/profile"
            >
              {copy.dashboard.viewProfileStats}
            </Link>
          </div>
        </div>
      </section>

      {localizedPendingProject ? (
        <section className="rounded-lg border border-coral/25 bg-coral/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-coral">{copy.projects.pendingTitle}</p>
              <h3 className="mt-2 text-2xl font-black">{localizedPendingProject.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{localizedPendingProject.description}</p>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md bg-coral px-5 py-4 text-center font-black text-paper transition hover:bg-coral/90"
              href={`/projects/${localizedPendingProject.id}`}
            >
              <Rocket className="size-5" />
              {copy.projects.openProject}
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <p className="text-sm font-bold uppercase text-ink/55">{copy.dashboard.completedModules}</p>
          <p className="mt-2 text-3xl font-black">{fallback.completedCount}</p>
          <p className="mt-2 text-sm text-ink/65">{copy.dashboard.lessonsCompletedHint}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <p className="text-sm font-bold uppercase text-ink/55">{copy.dashboard.activeCourse}</p>
          <p className="mt-2 text-xl font-black">{currentQuest.title}</p>
          <p className="mt-2 text-sm text-ink/65">{currentQuest.estimatedTime}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <p className="text-sm font-bold uppercase text-ink/55">{copy.dashboard.learningFocus}</p>
          <p className="mt-2 text-sm leading-6 text-ink/70">{copy.dashboard.learningFocusHint}</p>
          <Link className="mt-4 inline-flex text-sm font-bold text-violet hover:underline" href={`/lesson/${fallback.currentMission.id}`}>
            {copy.dashboard.openLesson}
          </Link>
        </div>
      </section>
    </div>
  );
}
