import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { LessonCard } from "@/components/lesson-card";
import { lessons } from "@/lib/data";
import { isLessonUnlocked } from "@/lib/level";
import { getNextLesson, getPathById, getPathProgress } from "@/lib/learning";
import { buildProgressSummary } from "@/lib/progress";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export default async function DashboardPage() {
  const { progress, userEmail, isDemo } = await getCurrentUserProgress();
  const summary = buildProgressSummary(progress);
  const currentLesson = getNextLesson(summary.completedIds) ?? lessons[0];
  const currentPath = getPathById(currentLesson.pathId);
  const currentPathProgress = currentPath ? getPathProgress(currentPath.id, summary.completedIds) : null;
  const nextLessons = lessons.filter((lesson) => !summary.completedIds.has(lesson.id)).slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-coral">{userEmail ?? (isDemo ? "Demo mode" : "Guest")}</p>
          <h1 className="mt-2 text-4xl font-black">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-ink/70">
            Track progress, unlock lessons, and keep the next learning step obvious.
          </p>
        </div>
        <Link className="rounded-md bg-ink px-4 py-3 text-center font-bold text-paper" href="/paths">
          Continue learning
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Level" value={String(summary.level)} tone="ink" />
        <StatCard label="XP" value={String(summary.xp)} tone="mint" />
        <StatCard label="Completed" value={`${summary.completedCount}/${summary.totalLessons}`} tone="coral" />
        <StatCard label="Progress" value={`${summary.completionPercent}%`} tone="violet" />
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-ink/10 bg-white/80 p-5">
          <p className="text-sm font-bold uppercase text-violet">Current path</p>
          <h2 className="mt-2 text-2xl font-black">{currentPath?.title ?? "Start learning"}</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            {currentPath?.description ?? "Pick a learning path and complete your first lesson."}
          </p>
          {currentPathProgress ? (
            <div className="mt-5">
              <div className="flex justify-between text-sm font-bold text-ink/70">
                <span>
                  {currentPathProgress.completed}/{currentPathProgress.total} lessons
                </span>
                <span>{currentPathProgress.percent}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-ink/10">
                <div className="h-3 rounded-full bg-mint" style={{ width: `${currentPathProgress.percent}%` }} />
              </div>
            </div>
          ) : null}
        </div>
        <div className="rounded-lg border border-ink/10 bg-ink p-5 text-paper">
          <p className="text-sm font-bold uppercase text-paper/70">Continue learning</p>
          <h2 className="mt-2 text-2xl font-black">{currentLesson.title}</h2>
          <p className="mt-2 text-sm leading-6 text-paper/75">{currentLesson.summary}</p>
          <Link
            className="mt-5 inline-flex rounded-md bg-paper px-4 py-3 font-bold text-ink transition hover:bg-paper/90"
            href={`/lesson/${currentLesson.id}`}
          >
            Open lesson
          </Link>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-black">Next lessons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {nextLessons.map((lesson) => (
            <LessonCard
              completed={summary.completedIds.has(lesson.id)}
              key={lesson.id}
              lesson={lesson}
              unlocked={isLessonUnlocked(lesson, summary.completedIds)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
