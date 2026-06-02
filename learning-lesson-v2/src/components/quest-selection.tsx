"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, ChevronRight } from "lucide-react";
import { gameQuests } from "@/lib/game-data";
import { getStoredProgress } from "@/lib/game-progress";
import { localizeGameQuest, t, type Language } from "@/lib/i18n";

export function QuestSelection({ language }: { language: Language }) {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const copy = t(language);

  useEffect(() => {
    setCompletedLessonIds(getStoredProgress().completedLessonIds);
  }, []);

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {gameQuests.map((rawQuest) => {
        const quest = localizeGameQuest(rawQuest, language);
        const completed = quest.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
        const progress = Math.round((completed / quest.lessonIds.length) * 100);
        const firstLesson = quest.lessonIds.find((id) => !completedLessonIds.includes(id)) ?? quest.lessonIds[0];
        const hasStarted = completed > 0;

        return (
          <article
            className="group rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
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
            <div className="mt-4">
              <div className="flex justify-between text-sm font-bold text-ink/70">
                <span>{completed}/{quest.lessonIds.length} {copy.paths.missions}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-ink/10">
                <div className="h-3 rounded-full bg-violet transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <Link
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-paper transition group-hover:bg-ink/90"
              href={`/lesson/${firstLesson}`}
            >
              {hasStarted ? copy.paths.continueQuest : copy.paths.startQuest}
              <ChevronRight className="size-5" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
