import type { LocalizedLessonStructure } from "@/lib/lesson-structure";
import { t, type Language } from "@/lib/i18n";

export function LessonKeyConcepts({
  language,
  structure
}: {
  language: Language;
  structure: LocalizedLessonStructure;
}) {
  const copy = t(language);

  return (
    <section className="mt-8 rounded-lg border border-violet/20 bg-violet/5 p-5">
      <h2 className="text-lg font-black">{copy.syllabus.keyConcepts}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {structure.keyConcepts.map((concept) => (
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink/80 shadow-sm" key={concept}>
            {concept}
          </span>
        ))}
      </div>
    </section>
  );
}
