import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CompleteLessonButton } from "@/components/complete-lesson-button";
import { getLesson } from "@/lib/data";
import { isLessonUnlocked } from "@/lib/level";
import { getLessonExample, getLessonPractice, getPathById } from "@/lib/learning";
import { localizeLesson, localizePath, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { buildProgressSummary } from "@/lib/progress";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const rawLesson = getLesson(id);

  if (!rawLesson) {
    notFound();
  }

  const lesson = localizeLesson(rawLesson, language);

  const { progress, isDemo } = await getCurrentUserProgress();
  const summary = buildProgressSummary(progress);
  const unlocked = isLessonUnlocked(lesson, summary.completedIds);
  const completed = summary.completedIds.has(lesson.id);
  const rawPath = getPathById(lesson.pathId);
  const path = rawPath ? localizePath(rawPath, language) : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink" href="/paths">
        <ArrowLeft className="size-4" />
        {copy.common.backToPaths}
      </Link>
      <article className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-violet">
              {path?.title ?? copy.paths.badge} · {lesson.xp} XP
            </p>
            <h1 className="mt-2 text-4xl font-black">{lesson.title}</h1>
            <p className="mt-3 text-ink/70">{lesson.summary}</p>
          </div>
          <span className="w-fit rounded-md bg-ink/10 px-3 py-2 text-sm font-bold">
            {completed ? copy.common.completed : unlocked ? copy.common.unlocked : copy.common.locked}
          </span>
        </div>
        <div className="mt-8 rounded-lg bg-paper p-5 text-lg leading-8 text-ink/80">
          {unlocked ? lesson.content : copy.lesson.lockedMessage}
        </div>
        {unlocked ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-ink/10 bg-white p-4">
              <h2 className="font-black">{copy.lesson.understand}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/70">
                {copy.lesson.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-ink/10 bg-white p-4">
              <h2 className="font-black">{copy.lesson.practice}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/70">{getLessonPractice(lesson.id, language)}</p>
            </section>
          </div>
        ) : null}
        {unlocked ? (
          <section className="mt-5 rounded-lg border border-ink/10 bg-ink p-4 text-paper">
            <h2 className="font-black">{copy.lesson.example}</h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-black/20 p-4 text-sm leading-6">
              <code>{getLessonExample(lesson.id)}</code>
            </pre>
          </section>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CompleteLessonButton
            disabled={!unlocked || completed || isDemo}
            labels={{ ...copy.lesson, working: copy.login.working }}
            lessonId={lesson.id}
          />
          {isDemo ? <p className="text-sm text-ink/60">{copy.lesson.demoSave}</p> : null}
        </div>
      </article>
    </main>
  );
}
