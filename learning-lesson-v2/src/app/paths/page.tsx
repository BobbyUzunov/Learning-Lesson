import { LessonCard } from "@/components/lesson-card";
import { getPathLessons, learningPaths } from "@/lib/data";
import { isLessonUnlocked } from "@/lib/level";
import { localizeLesson, localizePath, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { buildProgressSummary } from "@/lib/progress";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export default async function PathsPage() {
  const language = await getLanguage();
  const copy = t(language);
  const { progress } = await getCurrentUserProgress();
  const summary = buildProgressSummary(progress);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase text-mint">{copy.paths.badge}</p>
        <h1 className="mt-2 text-4xl font-black">{copy.paths.title}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.paths.subtitle}</p>
      </div>
      <div className="mt-8 space-y-8">
        {learningPaths.map((rawPath) => {
          const path = localizePath(rawPath, language);
          const pathLessons = getPathLessons(path.id).map((lesson) => localizeLesson(lesson, language));
          return (
            <section className="rounded-lg border border-ink/10 bg-white/70 p-5" key={path.id}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`size-3 rounded-full ${path.color}`} />
                    <h2 className="text-2xl font-black">{path.title}</h2>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{path.description}</p>
                </div>
                <span className="w-fit rounded-md bg-ink/10 px-3 py-2 text-sm font-bold">
                  {copy.paths.level} {path.requiredLevel}+
                </span>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {pathLessons.map((lesson) => (
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
          );
        })}
      </div>
    </main>
  );
}
