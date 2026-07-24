"use client";

import { Clock3, ListChecks, Sparkles } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumAccent, CurriculumMission, CurriculumModule } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t, type Language } from "@/lib/i18n";

export type MissionGroup = {
  module: CurriculumModule;
  missions: CurriculumMission[];
};

type MissionListProps = {
  accent: CurriculumAccent;
  groups: MissionGroup[];
  language: Language;
  onSelect: (missionId: string) => void;
  selectedMissionId: string;
};

export function MissionList({ accent, groups, language, onSelect, selectedMissionId }: MissionListProps) {
  const copy = t(language).schoolCurriculum;
  const style = curriculumAccentStyles[accent];

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex items-start gap-4">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${style.soft} ${style.text}`}>
          <ListChecks className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-black sm:text-xl">{copy.missionLibrary}</h2>
          <p className="mt-1 text-sm leading-6 text-ink/55">{copy.missionLibraryHint}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {groups.map(({ module, missions }) => (
          <article className="rounded-2xl border border-ink/10 bg-paper/60 p-4" key={module.id}>
            <header className="border-b border-ink/10 pb-3">
              {module.specialtyId === null ? (
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-ink/40">
                  <Sparkles className="size-3" />
                  {copy.sharedModuleLabel}
                </p>
              ) : null}
              <p className="mt-1 font-black leading-6">{localizeCurriculumText(module.title, language)}</p>
              <p className="mt-1 text-xs font-bold text-ink/45">
                {missions.length} {copy.missionsLabel}
              </p>
            </header>

            <ul className="mt-3 space-y-1.5">
              {missions.map((mission, index) => {
                const isSelected = mission.id === selectedMissionId;

                return (
                  <li key={mission.id}>
                    <button
                      aria-current={isSelected}
                      className={`focus-ring flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                        isSelected ? `${style.soft} ${style.text}` : "text-ink/70 hover:bg-ink/5"
                      }`}
                      onClick={() => onSelect(mission.id)}
                      type="button"
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${
                          isSelected ? `${style.icon}` : "bg-ink/5 text-ink/45"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-bold leading-5">
                        {localizeCurriculumText(mission.title, language)}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-black text-ink/40">
                        <Clock3 className="size-3" />
                        {mission.estimatedMinutes}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
