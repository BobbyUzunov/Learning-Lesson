import { BookOpen, Clock3, ListChecks, Route } from "lucide-react";
import type { LocalizedLessonStructure } from "@/lib/lesson-structure";
import { formatMessage, t, type Language } from "@/lib/i18n";

export function LessonOutline({
  courseTitle,
  language,
  lessonTitle,
  structure
}: {
  courseTitle: string;
  language: Language;
  lessonTitle: string;
  structure: LocalizedLessonStructure;
}) {
  const copy = t(language);

  return (
    <header className="rounded-lg border border-ink/10 bg-mint/10 p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink/60">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1">
          <Route className="size-3.5 text-violet" />
          {courseTitle}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1">
          <BookOpen className="size-3.5 text-violet" />
          {formatMessage(copy.syllabus.moduleLabel, {
            current: structure.moduleNumber,
            total: structure.moduleTotal
          })}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1">
          <Clock3 className="size-3.5 text-violet" />
          {structure.readingTimeMinutes} {copy.syllabus.readingTime}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-black md:text-4xl">{lessonTitle}</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-sm font-black">
            <ListChecks className="size-4 text-mint" />
            {copy.syllabus.objectives}
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/75">
            {structure.learningObjectives.map((item) => (
              <li className="flex gap-2" key={item}>
                <span className="text-violet">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-ink/10 bg-white/80 p-4">
          <p className="text-sm font-black">{copy.syllabus.prerequisites}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/75">
            {structure.prerequisites.map((item) => (
              <li className="flex gap-2" key={item}>
                <span className="text-coral">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
