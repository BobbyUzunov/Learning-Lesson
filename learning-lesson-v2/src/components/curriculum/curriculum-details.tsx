import { BookOpenCheck, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumModule } from "@/lib/curriculum/types";
import { t, type Language } from "@/lib/i18n";

type CurriculumDetailsProps = {
  commonModules: CurriculumModule[];
  language: Language;
  specialtyModules: CurriculumModule[];
};

export function CurriculumDetails({ commonModules, language, specialtyModules }: CurriculumDetailsProps) {
  const copy = t(language).schoolCurriculum;

  return (
    <details className="group rounded-3xl border border-ink/10 bg-white">
      <summary className="focus-ring flex min-h-20 cursor-pointer list-none items-center gap-4 rounded-3xl px-5 py-4 sm:px-7 [&::-webkit-details-marker]:hidden">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet/10 text-violet">
          <BookOpenCheck className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-black">{copy.officialDetails}</span>
          <span className="mt-1 block text-sm text-ink/50">{copy.officialDetailsHint}</span>
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink/5 text-xl font-light transition group-open:rotate-45">+</span>
      </summary>

      <div className="border-t border-ink/10 p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <section className="rounded-2xl bg-paper p-5">
            <h3 className="flex items-center gap-2 font-black">
              <Sparkles className="size-4 text-mint" />
              {copy.commonFoundation}
            </h3>
            {commonModules.map((module) => (
              <div className="mt-4" key={module.id}>
                <p className="font-bold">{localizeCurriculumText(module.title, language)}</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">{localizeCurriculumText(module.description, language)}</p>
              </div>
            ))}
          </section>

          <section>
            <h3 className="font-black">{copy.officialModules}</h3>
            <div className="mt-4 space-y-3">
              {specialtyModules.map((module) => (
                <article className="rounded-2xl border border-ink/10 p-5" key={module.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <p className="text-lg font-black">{localizeCurriculumText(module.title, language)}</p>
                      <p className="mt-2 text-sm leading-6 text-ink/65">{localizeCurriculumText(module.description, language)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-black text-ink/55">
                      {module.theoryHours ? <span className="rounded-full bg-paper px-3 py-1.5">{module.theoryHours} ч. · {copy.theory}</span> : null}
                      {module.practiceHours ? <span className="rounded-full bg-paper px-3 py-1.5">{module.practiceHours} ч. · {copy.practice}</span> : null}
                    </div>
                  </div>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {module.learningOutcomes.map((outcome) => (
                      <li className="flex gap-2 text-sm leading-6 text-ink/70" key={outcome.en}>
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-mint" />
                        {localizeCurriculumText(outcome, language)}
                      </li>
                    ))}
                  </ul>
                  {module.sourceUrl ? (
                    <a className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-violet hover:underline" href={module.sourceUrl} rel="noreferrer" target="_blank">
                      {copy.officialPlan}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </details>
  );
}
