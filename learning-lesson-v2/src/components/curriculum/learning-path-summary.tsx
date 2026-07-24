import { ArrowUpRight, BriefcaseBusiness, Layers3 } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumMission, SchoolSpecialty } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t, type Language } from "@/lib/i18n";

type LearningPathSummaryProps = {
  courseIds: string[];
  courseLabels: Record<string, string>;
  language: Language;
  mission: CurriculumMission;
  specialty: SchoolSpecialty;
};

export function LearningPathSummary({ courseIds, courseLabels, language, mission, specialty }: LearningPathSummaryProps) {
  const copy = t(language).schoolCurriculum;
  const style = curriculumAccentStyles[specialty.accent];

  return (
    <aside className="space-y-4">
      <section className="rounded-3xl bg-ink p-5 text-paper sm:p-6">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-paper/45">
          <BriefcaseBusiness className="size-4" />
          {copy.careerSnapshot}
        </p>
        <h2 className="mt-4 text-2xl font-black">{localizeCurriculumText(specialty.title, language)}</h2>
        <p className="mt-3 text-sm leading-6 text-paper/60">{localizeCurriculumText(specialty.description, language)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {mission.skills.map((skill) => (
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold" key={skill.en}>
              {localizeCurriculumText(skill, language)}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-ink/45">
          <Layers3 className="size-4" />
          {copy.courseRoute}
        </p>
        <ol className="mt-4 space-y-2">
          {courseIds.map((courseId, index) => (
            <li key={courseId}>
              <a
                className="group flex items-center gap-3 rounded-xl border border-ink/10 px-3 py-3 transition hover:border-violet/30 hover:bg-paper"
                href={`#course-${courseId}`}
              >
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-black ${index === 0 ? `${style.soft} ${style.text}` : "bg-ink/5 text-ink/45"}`}>
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 font-bold">{courseLabels[courseId]}</span>
                <ArrowUpRight className="size-4 text-ink/30 transition group-hover:text-violet" />
              </a>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
