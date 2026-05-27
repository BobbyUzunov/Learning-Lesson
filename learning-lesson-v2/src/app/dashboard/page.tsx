import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { LessonCard } from "@/components/lesson-card";
import { lessons } from "@/lib/data";
import { isLessonUnlocked } from "@/lib/level";
import { getNextLesson, getPathById, getPathProgress } from "@/lib/learning";
import { localizeLesson, localizePath, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { buildProgressSummary } from "@/lib/progress";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export default async function DashboardPage() {
  const language = await getLanguage();
  const copy = t(language);
  const { progress, userEmail, isDemo } = await getCurrentUserProgress();
  const summary = buildProgressSummary(progress);
  const currentLessonRaw = getNextLesson(summary.completedIds) ?? lessons[0];
  const currentLesson = localizeLesson(currentLessonRaw, language);
  const currentPathRaw = getPathById(currentLesson.pathId);
  const currentPath = currentPathRaw ? localizePath(currentPathRaw, language) : null;
  const currentPathProgress = currentPath ? getPathProgress(currentPath.id, summary.completedIds) : null;
  const nextLessons = lessons
    .filter((lesson) => !summary.completedIds.has(lesson.id))
    .slice(0, 3)
    .map((lesson) => localizeLesson(lesson, language));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-coral">
            {userEmail ?? (isDemo ? copy.dashboard.demo : copy.dashboard.guest)}
          </p>
          <h1 className="mt-2 text-4xl font-black">{copy.dashboard.title}</h1>
          <p className="mt-3 max-w-2xl text-ink/70">{copy.dashboard.subtitle}</p>
        </div>
        <Link className="rounded-md bg-ink px-4 py-3 text-center font-bold text-paper" href="/paths">
          {copy.dashboard.continueLearning}
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={copy.dashboard.level} value={String(summary.level)} tone="ink" />
        <StatCard label={copy.dashboard.xp} value={String(summary.xp)} tone="mint" />
        <StatCard label={copy.dashboard.completed} value={`${summary.completedCount}/${summary.totalLessons}`} tone="coral" />
        <StatCard label={copy.dashboard.progress} value={`${summary.completionPercent}%`} tone="violet" />
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-ink/10 bg-white/80 p-5">
          <p className="text-sm font-bold uppercase text-violet">{copy.dashboard.currentPath}</p>
          <h2 className="mt-2 text-2xl font-black">{currentPath?.title ?? copy.dashboard.startLearning}</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">{currentPath?.description ?? copy.dashboard.pickPath}</p>
          {currentPathProgress ? (
            <div className="mt-5">
              <div className="flex justify-between text-sm font-bold text-ink/70">
                <span>
                  {currentPathProgress.completed}/{currentPathProgress.total} {copy.dashboard.lessons}
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
          <p className="text-sm font-bold uppercase text-paper/70">{copy.dashboard.continueLearning}</p>
          <h2 className="mt-2 text-2xl font-black">{currentLesson.title}</h2>
          <p className="mt-2 text-sm leading-6 text-paper/75">{currentLesson.summary}</p>
          <Link
            className="mt-5 inline-flex rounded-md bg-paper px-4 py-3 font-bold text-ink transition hover:bg-paper/90"
            href={`/lesson/${currentLesson.id}`}
          >
            {copy.common.openLesson}
          </Link>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-black">{copy.dashboard.nextLessons}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {nextLessons.map((lesson) => (
            <LessonCard
              completed={summary.completedIds.has(lesson.id)}
              key={lesson.id}
              lesson={lesson}
              unlocked={isLessonUnlocked(lesson, summary.completedIds)}
              labels={copy.common}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
