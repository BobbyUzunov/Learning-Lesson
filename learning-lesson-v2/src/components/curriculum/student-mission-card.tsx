import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumMission, SchoolSpecialty } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t, type Language } from "@/lib/i18n";

type StudentMissionCardProps = {
  firstCourseId?: string;
  language: Language;
  mission: CurriculumMission;
  specialty: SchoolSpecialty;
  onBrowseAll: () => void;
};

export function StudentMissionCard({
  firstCourseId,
  language,
  mission,
  specialty,
  onBrowseAll
}: StudentMissionCardProps) {
  const copy = t(language).schoolCurriculum;
  const style = curriculumAccentStyles[specialty.accent];
  const startHref = firstCourseId ? `#course-${firstCourseId}` : "#practical-courses";

  return (
    <section
      aria-live="polite"
      className={`rounded-2xl border bg-white p-5 shadow-soft sm:p-6 ${style.border}`}
      id="recommended-mission"
    >
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${style.text}`}>{copy.recommendedMission}</p>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
        {localizeCurriculumText(mission.title, language)}
      </h2>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{copy.whatYouWillDo}</p>
          <p className="mt-2 text-base leading-7 text-ink/70">{localizeCurriculumText(mission.brief, language)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{copy.whatYouWillSubmit}</p>
          <p className="mt-2 text-base leading-7 text-ink/70">{localizeCurriculumText(mission.deliverable, language)}</p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm font-bold text-ink/60">
          <Clock3 className="size-4" />
          {mission.estimatedMinutes} {copy.minutes}
        </p>
      </div>

      <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Link
          className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition hover:-translate-y-0.5 ${style.button}`}
          href={startHref}
        >
          {copy.startMission}
          <ArrowRight className="size-5" />
        </Link>
        <button
          className="text-sm font-semibold text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
          onClick={onBrowseAll}
          type="button"
        >
          {copy.browseAllMissions}
        </button>
      </div>
    </section>
  );
}
