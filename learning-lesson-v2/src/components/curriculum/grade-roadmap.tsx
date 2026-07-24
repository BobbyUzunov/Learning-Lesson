import { Check } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

const gradeLevels = [8, 9, 10, 11, 12] as const;
const gradeLabelsBg: Record<number, string> = { 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII" };

type GradeRoadmapProps = {
  activeGrade: number;
  language: Language;
};

function gradeLabel(grade: number, language: Language) {
  return language === "bg" ? gradeLabelsBg[grade] ?? `${grade}` : `G${grade}`;
}

export function GradeRoadmap({ activeGrade, language }: GradeRoadmapProps) {
  const copy = t(language).schoolCurriculum;

  return (
    <div className="mt-7 border-t border-white/10 pt-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-paper/50">{copy.gradeRoadmap}</p>
        <p className="text-xs font-bold text-mint">
          {copy.activeGrade}: {gradeLabel(activeGrade, language)}
        </p>
      </div>
      <ol className="mt-3 grid min-w-[560px] grid-cols-5 gap-2" aria-label={copy.gradeRoadmap}>
        {gradeLevels.map((grade) => {
          const isActive = grade === activeGrade;
          return (
            <li
              className={`relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-black ${
                isActive
                  ? "border-mint/50 bg-mint/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-paper/35"
              }`}
              key={grade}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] ${
                  isActive ? "bg-mint text-ink" : "bg-white/10"
                }`}
              >
                {isActive ? <Check className="size-3.5" /> : grade}
              </span>
              <span>{gradeLabel(grade, language)}</span>
              <span className="ml-auto hidden text-[9px] uppercase tracking-wide opacity-70 xl:inline">
                {isActive ? copy.now : copy.plannedGrade}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
