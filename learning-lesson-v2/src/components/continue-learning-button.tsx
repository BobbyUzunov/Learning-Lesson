"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getStoredProgress, getGameProgressStats } from "@/lib/game-progress";
import type { GameQuest } from "@/lib/game-data";
import { gameQuests } from "@/lib/game-data";
import { getGlobalNextLessonFromCourses } from "@/lib/catalog/helpers";

type ContinueLearningButtonProps = {
  className?: string;
  completedLessonIds?: string[];
  courses?: GameQuest[];
  label: string;
};

export function ContinueLearningButton({
  className,
  completedLessonIds,
  courses = gameQuests,
  label
}: ContinueLearningButtonProps) {
  const [href, setHref] = useState("/lesson/1");

  useEffect(() => {
    if (completedLessonIds) {
      const nextLessonId = getGlobalNextLessonFromCourses(courses, completedLessonIds) ?? courses[0]?.lessonIds[0] ?? "1";
      setHref(`/lesson/${nextLessonId}`);
      return;
    }

    const progress = getStoredProgress();
    const stats = getGameProgressStats(progress, undefined, courses);
    setHref(`/lesson/${stats.currentMission.id}`);
  }, [completedLessonIds, courses]);

  return (
    <Link
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-md bg-mint px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mint/80"
      }
      href={href}
    >
      {label}
      <ArrowRight className="size-5" />
    </Link>
  );
}
