import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CompleteLessonButton } from "@/components/complete-lesson-button";
import { getLesson } from "@/lib/data";
import { isLessonUnlocked } from "@/lib/level";
import { buildProgressSummary } from "@/lib/progress";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lesson = getLesson(id);

  if (!lesson) {
    notFound();
  }

  const { progress, isDemo } = await getCurrentUserProgress();
  const summary = buildProgressSummary(progress);
  const unlocked = isLessonUnlocked(lesson, summary.completedIds);
  const completed = summary.completedIds.has(lesson.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink" href="/paths">
        <ArrowLeft className="size-4" />
        Back to paths
      </Link>
      <article className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-violet">{lesson.xp} XP</p>
            <h1 className="mt-2 text-4xl font-black">{lesson.title}</h1>
            <p className="mt-3 text-ink/70">{lesson.summary}</p>
          </div>
          <span className="w-fit rounded-md bg-ink/10 px-3 py-2 text-sm font-bold">
            {completed ? "Completed" : unlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
        <div className="mt-8 rounded-lg bg-paper p-5 text-lg leading-8 text-ink/80">
          {unlocked ? lesson.content : "Complete the previous lesson to unlock this one."}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CompleteLessonButton disabled={!unlocked || completed || isDemo} lessonId={lesson.id} />
          {isDemo ? <p className="text-sm text-ink/60">Connect Supabase and log in to save real progress.</p> : null}
        </div>
      </article>
    </main>
  );
}
