import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Flag, Sparkles, Trophy } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumMission, SchoolSpecialty } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t, type Language } from "@/lib/i18n";

type StudentMissionCardProps = {
  firstCourseId?: string;
  language: Language;
  mission: CurriculumMission;
  specialty: SchoolSpecialty;
};

export function StudentMissionCard({ firstCourseId, language, mission, specialty }: StudentMissionCardProps) {
  const copy = t(language).schoolCurriculum;
  const style = curriculumAccentStyles[specialty.accent];
  const shortStep = Math.max(5, Math.round(mission.estimatedMinutes * 0.2 / 5) * 5);
  const buildStep = mission.estimatedMinutes - shortStep * 2;
  const plan = [
    { label: copy.planUnderstand, minutes: shortStep },
    { label: copy.planBuild, minutes: buildStep },
    { label: copy.planCheck, minutes: shortStep }
  ];

  return (
    <section className={`relative overflow-hidden rounded-3xl border bg-white p-5 shadow-soft sm:p-7 ${style.border}`}>
      <span className={`absolute -right-20 -top-20 size-64 rounded-full blur-3xl ${style.glow}`} />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase ${style.soft} ${style.text}`}>
              <Flag className="size-3.5" />
              02 · {copy.missionBadge}
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
              {localizeCurriculumText(mission.title, language)}
            </h2>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs font-black text-ink/60">
              <Clock3 className="size-3.5" />
              {mission.estimatedMinutes} {copy.minutes}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs font-black text-ink/60">
              <Trophy className="size-3.5" />
              100 XP
            </span>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/70">{localizeCurriculumText(mission.brief, language)}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl bg-ink p-5 text-paper sm:p-6">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-mint">
              <Sparkles className="size-4" />
              {copy.deliverable}
            </p>
            <p className="mt-3 text-xl font-black leading-8">{localizeCurriculumText(mission.deliverable, language)}</p>
            <p className="mt-3 text-sm leading-6 text-paper/55">{copy.keepResultHint}</p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-paper/70 p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/45">{copy.missionPlan}</p>
            <ol className="mt-4 space-y-4">
              {plan.map((step, index) => (
                <li className="flex items-center gap-3" key={step.label}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${style.soft} ${style.text}`}>
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 font-bold">{step.label}</span>
                  <span className="text-xs font-black text-ink/40">{step.minutes} {copy.minutesShort}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {firstCourseId ? (
            <Link
              className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-center font-black shadow-sm transition hover:-translate-y-0.5 ${style.button}`}
              href={`#course-${firstCourseId}`}
            >
              {copy.startMission}
              <ArrowRight className="size-5" />
            </Link>
          ) : null}
          <p className="flex items-center gap-2 text-sm font-semibold text-ink/55">
            <CheckCircle2 className="size-4 text-mint" />
            {copy.noExperienceNeeded}
          </p>
        </div>
      </div>
    </section>
  );
}
