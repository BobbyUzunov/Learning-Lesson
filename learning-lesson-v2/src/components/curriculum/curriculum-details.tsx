import { BookOpenCheck, CheckCircle2, ExternalLink } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumModule, LocalizedText } from "@/lib/curriculum/types";
import { t, type Language } from "@/lib/i18n";

type CurriculumDetailsProps = {
  commonModules: CurriculumModule[];
  language: Language;
  professionCode: string;
  specialtyModules: CurriculumModule[];
  specialtyTitle: LocalizedText;
};

export function CurriculumDetails({
  commonModules,
  language,
  professionCode,
  specialtyModules,
  specialtyTitle
}: CurriculumDetailsProps) {
  const copy = t(language).schoolCurriculum;

  return (
    <details className="group rounded-2xl border border-ink/10 bg-white">
      <summary className="focus-ring flex min-h-16 cursor-pointer list-none items-center gap-4 rounded-2xl px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink/5 text-ink">
          <BookOpenCheck className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{copy.officialDetails}</span>
          <span className="mt-1 block text-sm text-ink/50">{copy.officialDetailsHint}</span>
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink/5 text-lg font-light transition group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="space-y-6 border-t border-ink/10 p-5">
        <div>
          <p className="text-sm font-bold text-ink/70">{localizeCurriculumText(specialtyTitle, language)}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-ink/40">
            {copy.professionCode} · {professionCode}
          </p>
        </div>

        <section>
          <h3 className="font-bold">{copy.officialModules}</h3>
          <div className="mt-3 space-y-3">
            {specialtyModules.map((module) => (
              <article className="rounded-xl border border-ink/10 p-4" key={module.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-2xl">
                    <p className="font-bold">{localizeCurriculumText(module.title, language)}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/65">
                      {localizeCurriculumText(module.description, language)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold text-ink/55">
                    {module.theoryHours ? (
                      <span className="rounded-full bg-paper px-3 py-1.5">
                        {module.theoryHours} ч. · {copy.theory}
                      </span>
                    ) : null}
                    {module.practiceHours ? (
                      <span className="rounded-full bg-paper px-3 py-1.5">
                        {module.practiceHours} ч. · {copy.practice}
                      </span>
                    ) : null}
                  </div>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {module.learningOutcomes.map((outcome) => (
                    <li className="flex gap-2 text-sm leading-6 text-ink/70" key={outcome.en}>
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-mint" />
                      {localizeCurriculumText(outcome, language)}
                    </li>
                  ))}
                </ul>
                {module.sourceUrl ? (
                  <a
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-violet hover:underline"
                    href={module.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {copy.officialPlan}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {commonModules.length > 0 ? (
          <section>
            <h3 className="font-bold">{copy.commonFoundation}</h3>
            {commonModules.map((module) => (
              <div className="mt-3" key={module.id}>
                <p className="font-bold">{localizeCurriculumText(module.title, language)}</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  {localizeCurriculumText(module.description, language)}
                </p>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </details>
  );
}
