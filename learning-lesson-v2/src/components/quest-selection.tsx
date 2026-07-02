"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, ChevronRight } from "lucide-react";
import { gameQuests, getNextLessonInQuest, isLessonUnlocked } from "@/lib/game-data";
import { getStoredProgress } from "@/lib/game-progress";
import { formatMissionsProgress, localizeGameQuest, t, type Language } from "@/lib/i18n";

export function QuestSelection({
  completedLessonIds: initialCompletedLessonIds,
  isAuthenticated,
  showGuestLockMessage = false,
  showLessonLockMessage = false,
  language
}: {
  completedLessonIds?: string[];
  isAuthenticated: boolean;
  showGuestLockMessage?: boolean;
  showLessonLockMessage?: boolean;
  language: Language;
}) {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(initialCompletedLessonIds ?? []);
  const [lockMessage, setLockMessage] = useState<string | null>(() => {
    if (!isAuthenticated && showGuestLockMessage) {
      return t(language).paths.guestLockMessage;
    }
    if (isAuthenticated && showLessonLockMessage) {
      return t(language).paths.lessonLockMessage;
    }
    return null;
  });
  const copy = t(language);

  useEffect(() => {
    if (showGuestLockMessage && !isAuthenticated) {
      setLockMessage(copy.paths.guestLockMessage);
      return;
    }

    if (showLessonLockMessage && isAuthenticated) {
      setLockMessage(copy.paths.lessonLockMessage);
      return;
    }

    if (isAuthenticated) {
      setLockMessage(null);
      return;
    }

    if (!initialCompletedLessonIds) {
      setCompletedLessonIds(getStoredProgress().completedLessonIds);
    }
  }, [copy.paths.guestLockMessage, copy.paths.lessonLockMessage, initialCompletedLessonIds, isAuthenticated, showGuestLockMessage, showLessonLockMessage]);

  return (
    <div className="mt-8">
      {!isAuthenticated ? (
        <p className="mb-4 rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">{copy.paths.guestFreeMission}</p>
      ) : null}
      {lockMessage ? (
        <p className="mb-4 rounded-md bg-violet/15 px-4 py-3 text-sm font-bold text-ink">{lockMessage}</p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {gameQuests.map((rawQuest) => {
        const quest = localizeGameQuest(rawQuest, language);
        const availableMissions = quest.lessonIds.length;
        const plannedMissions = Math.max(quest.levels, availableMissions);
        const completed = quest.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
        const progress = Math.round((completed / plannedMissions) * 100);
        const nextLesson = getNextLessonInQuest(quest.id, completedLessonIds);
        const hasStarted = completed > 0;
        const isGuestAllowedQuest = quest.id === "frontend" && nextLesson === "1";
        const guestLocked = !isAuthenticated && !isGuestAllowedQuest;
        const lessonLocked =
          isAuthenticated && nextLesson ? !isLessonUnlocked(nextLesson, completedLessonIds) : false;
        const href = nextLesson ? `/lesson/${nextLesson}` : "/paths";

        return (
          <article
            className="group rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet/30 hover:bg-white hover:shadow-soft"
            key={quest.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-violet">{quest.difficulty}</p>
                <h2 className="mt-2 text-2xl font-black">{quest.title}</h2>
              </div>
              <span className="rounded-md bg-mint/15 px-2 py-1 text-xs font-bold text-ink">{quest.levels} {copy.paths.levels}</span>
            </div>
            <p className="mt-3 min-h-16 text-sm leading-6 text-ink/70">{quest.description}</p>
            <div className="mt-4 flex items-center gap-2 rounded-md bg-ink/5 px-3 py-2 text-sm font-bold">
              <Award className="size-4 text-coral" />
              {quest.rewardBadge}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-ink/65">
              <span className="rounded-md bg-ink/5 px-2 py-2">{copy.paths.timeLabel}: {quest.estimatedTime}</span>
              <span className="rounded-md bg-ink/5 px-2 py-2">{copy.paths.xpRewardsLabel}: {quest.xpReward}</span>
              <span className="rounded-md bg-ink/5 px-2 py-2">{copy.paths.availableLabel}: {availableMissions}</span>
              <span className="rounded-md bg-ink/5 px-2 py-2">{copy.paths.plannedLabel}: {plannedMissions}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm font-bold text-ink/70">
                <span>{formatMissionsProgress(language, availableMissions, plannedMissions)}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-ink/10">
                <div className="h-3 rounded-full bg-violet transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            {guestLocked || lessonLocked ? (
              <button
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-ink/5 px-4 py-3 text-center font-bold text-ink/70 transition"
                onClick={() =>
                  setLockMessage(guestLocked ? copy.paths.guestLockMessage : copy.paths.lessonLockMessage)
                }
                type="button"
              >
                {copy.common.locked}
                <ChevronRight className="size-5" />
              </button>
            ) : (
              <Link
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-center font-bold text-paper transition hover:bg-ink/90 group-hover:-translate-y-0.5"
                href={href}
              >
                {hasStarted ? copy.paths.continueQuest : copy.paths.startQuest}
                <ChevronRight className="size-5" />
              </Link>
            )}
          </article>
        );
      })}
      </div>
    </div>
  );
}
