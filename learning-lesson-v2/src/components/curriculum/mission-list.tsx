"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Clock3 } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumAccent, CurriculumMission, CurriculumModule } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t, type Language } from "@/lib/i18n";

export type MissionGroup = {
  module: CurriculumModule;
  missions: CurriculumMission[];
};

const PREVIEW_COUNT = 3;

type MissionListProps = {
  accent: CurriculumAccent;
  specialtyGroups: MissionGroup[];
  commonGroups: MissionGroup[];
  language: Language;
  onSelect: (missionId: string) => void;
  selectedMissionId: string;
  selectedMission: CurriculumMission | null;
};

function ModuleAccordion({
  accent,
  group,
  isOpen,
  language,
  onToggle,
  onSelect,
  selectedMissionId,
  showDetail,
  selectedMission
}: {
  accent: CurriculumAccent;
  group: MissionGroup;
  isOpen: boolean;
  language: Language;
  onToggle: () => void;
  onSelect: (missionId: string) => void;
  selectedMissionId: string;
  showDetail: boolean;
  selectedMission: CurriculumMission | null;
}) {
  const copy = t(language).schoolCurriculum;
  const style = curriculumAccentStyles[accent];
  const [showAll, setShowAll] = useState(false);
  const selectedIndex = group.missions.findIndex((mission) => mission.id === selectedMissionId);
  const needsExpand = selectedIndex >= PREVIEW_COUNT;
  const visibleMissions = showAll || needsExpand ? group.missions : group.missions.slice(0, PREVIEW_COUNT);
  const hiddenCount = Math.max(0, group.missions.length - PREVIEW_COUNT);

  useEffect(() => {
    if (!isOpen) {
      setShowAll(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && needsExpand) {
      setShowAll(true);
    }
  }, [isOpen, needsExpand, selectedMissionId]);

  return (
    <article className="rounded-2xl border border-ink/10 bg-white">
      <button
        aria-expanded={isOpen}
        className="focus-ring flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left sm:px-5"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-bold leading-6">{localizeCurriculumText(group.module.title, language)}</span>
          <span className="mt-1 block text-xs font-bold text-ink/45">
            {group.missions.length} {copy.missionsLabel}
          </span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-ink/40 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="border-t border-ink/10 px-4 pb-4 sm:px-5 sm:pb-5">
          <ul className="mt-3 space-y-1.5">
            {visibleMissions.map((mission, index) => {
              const isSelected = mission.id === selectedMissionId;

              return (
                <li key={mission.id}>
                    <button
                      aria-current={isSelected}
                      className={`focus-ring flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                        isSelected ? `${style.soft} ${style.text}` : "text-ink/70 hover:bg-ink/5"
                      }`}
                      onClick={() => {
                        onSelect(mission.id);
                        requestAnimationFrame(() => {
                          document.getElementById("selected-mission-detail")?.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest"
                          });
                        });
                      }}
                      type="button"
                    >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        isSelected ? style.icon : "bg-ink/5 text-ink/45"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-bold leading-5">
                      {localizeCurriculumText(mission.title, language)}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-ink/40">
                      <Clock3 className="size-3" />
                      {mission.estimatedMinutes}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {hiddenCount > 0 ? (
            <button
              className="mt-3 text-sm font-bold text-violet underline-offset-4 hover:underline"
              onClick={() => setShowAll((value) => !value)}
              type="button"
            >
              {showAll ? copy.showLess : `${copy.seeMore} (${hiddenCount})`}
            </button>
          ) : null}

          {showDetail && selectedMission ? (
            <div className={`mt-4 rounded-xl border p-4 ${style.border} ${style.soft}`} id="selected-mission-detail">
              <p className="font-bold leading-6">{localizeCurriculumText(selectedMission.title, language)}</p>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                <span className="font-bold text-ink/80">{copy.whatYouWillDo}: </span>
                {localizeCurriculumText(selectedMission.brief, language)}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                <span className="font-bold text-ink/80">{copy.whatYouWillSubmit}: </span>
                {localizeCurriculumText(selectedMission.deliverable, language)}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ink/55">
                <Clock3 className="size-3.5" />
                {selectedMission.estimatedMinutes} {copy.minutes}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function MissionList({
  accent,
  specialtyGroups,
  commonGroups,
  language,
  onSelect,
  selectedMissionId,
  selectedMission
}: MissionListProps) {
  const copy = t(language).schoolCurriculum;
  const firstModuleId = specialtyGroups[0]?.module.id ?? "";
  const [openModuleId, setOpenModuleId] = useState(firstModuleId);
  const [commonOpen, setCommonOpen] = useState(false);

  useEffect(() => {
    setOpenModuleId(specialtyGroups[0]?.module.id ?? "");
    setCommonOpen(false);
  }, [specialtyGroups]);

  const selectedModuleId = useMemo(() => {
    if (!selectedMission) {
      return null;
    }
    return selectedMission.moduleId;
  }, [selectedMission]);

  useEffect(() => {
    if (!selectedModuleId) {
      return;
    }
    if (specialtyGroups.some((group) => group.module.id === selectedModuleId)) {
      setOpenModuleId(selectedModuleId);
      setCommonOpen(false);
      return;
    }
    if (commonGroups.some((group) => group.module.id === selectedModuleId)) {
      setCommonOpen(true);
    }
  }, [selectedModuleId, specialtyGroups, commonGroups]);

  if (specialtyGroups.length === 0 && commonGroups.length === 0) {
    return null;
  }

  return (
    <section className="scroll-mt-24" id="all-missions">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{copy.allMissions}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">{copy.allMissionsHint}</p>

      <div className="mt-5 space-y-3">
        {specialtyGroups.map((group) => (
          <ModuleAccordion
            accent={accent}
            group={group}
            isOpen={openModuleId === group.module.id}
            key={group.module.id}
            language={language}
            onSelect={onSelect}
            onToggle={() => setOpenModuleId((current) => (current === group.module.id ? "" : group.module.id))}
            selectedMission={selectedMission}
            selectedMissionId={selectedMissionId}
            showDetail={selectedMission?.moduleId === group.module.id}
          />
        ))}
      </div>

      {commonGroups.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-paper/70">
          <button
            aria-expanded={commonOpen}
            className="focus-ring flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left sm:px-5"
            onClick={() => setCommonOpen((value) => !value)}
            type="button"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{copy.commonSubjects}</span>
              <span className="mt-1 block text-xs font-bold text-ink/45">{copy.commonSubjectsHint}</span>
            </span>
            <ChevronDown className={`size-5 shrink-0 text-ink/40 transition ${commonOpen ? "rotate-180" : ""}`} />
          </button>

          {commonOpen ? (
            <div className="space-y-3 border-t border-ink/10 px-4 py-4 sm:px-5">
              {commonGroups.map((group) => (
                <ModuleAccordion
                  accent={accent}
                  group={group}
                  isOpen={openModuleId === group.module.id}
                  key={group.module.id}
                  language={language}
                  onSelect={onSelect}
                  onToggle={() => setOpenModuleId((current) => (current === group.module.id ? "" : group.module.id))}
                  selectedMission={selectedMission}
                  selectedMissionId={selectedMissionId}
                  showDetail={selectedMission?.moduleId === group.module.id}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
