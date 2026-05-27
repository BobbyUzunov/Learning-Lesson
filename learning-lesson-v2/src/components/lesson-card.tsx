import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import type { Lesson } from "@/lib/types";

type LessonCardProps = {
  lesson: Lesson;
  completed: boolean;
  unlocked: boolean;
};

export function LessonCard({ lesson, completed, unlocked }: LessonCardProps) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white/75 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-ink/50">Lesson {lesson.order}</p>
          <h3 className="mt-1 text-lg font-bold">{lesson.title}</h3>
        </div>
        <span className="rounded-md bg-ink/10 px-2 py-1 text-xs font-bold">{lesson.xp} XP</span>
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-ink/70">{lesson.summary}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink/70">
          {completed ? "Completed" : unlocked ? "Unlocked" : "Locked"}
        </span>
        {unlocked ? (
          <Link
            href={`/lesson/${lesson.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-paper transition hover:bg-ink/90"
          >
            <PlayCircle className="size-4" />
            Start
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-md bg-ink/10 px-3 py-2 text-sm font-bold text-ink/60">
            <Lock className="size-4" />
            Locked
          </span>
        )}
      </div>
    </article>
  );
}
