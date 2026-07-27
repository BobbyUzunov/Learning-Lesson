"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { CurriculumDetails } from "@/components/curriculum/curriculum-details";
import { MissionList } from "@/components/curriculum/mission-list";
import { SpecialtySelector } from "@/components/curriculum/specialty-selector";
import { StudentMissionCard } from "@/components/curriculum/student-mission-card";
import {
  getActiveGradeLevel,
  getCommonModules,
  getCourseIdsForSpecialty,
  getMissionsForModules,
  getSpecialtyModules,
  localizeCurriculumText
} from "@/lib/curriculum/helpers";
import type { MissionPrepInfo } from "@/lib/curriculum/mission-prep";
import type { SchoolCurriculum } from "@/lib/curriculum/types";
import { t, type Language } from "@/lib/i18n";

const SPECIALTY_STORAGE_KEY = "ll-selected-specialty";

type SchoolCurriculumExplorerProps = {
  courseLabels: Record<string, string>;
  curriculum: SchoolCurriculum;
  isAuthenticated: boolean;
  language: Language;
  pathsTitle: string;
  prepByCourseId: Record<string, MissionPrepInfo>;
};

function firstSpecialtyMissionId(curriculum: SchoolCurriculum, specialtyId: string) {
  const activeGrade = getActiveGradeLevel(curriculum);
  const specialtyModules = getSpecialtyModules(curriculum, specialtyId, activeGrade);
  const groups = getMissionsForModules(curriculum, specialtyModules);
  return groups[0]?.missions[0]?.id ?? "";
}

export function SchoolCurriculumExplorer({
  courseLabels,
  curriculum,
  isAuthenticated,
  language,
  pathsTitle,
  prepByCourseId
}: SchoolCurriculumExplorerProps) {
  const copy = t(language).schoolCurriculum;
  const fallbackSpecialtyId = curriculum.specialties[0]?.id ?? "software-development";
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(fallbackSpecialtyId);
  const [selectedMissionId, setSelectedMissionId] = useState(() =>
    firstSpecialtyMissionId(curriculum, fallbackSpecialtyId)
  );
  const [hasSavedSpecialty, setHasSavedSpecialty] = useState(false);
  const [changingDirection, setChangingDirection] = useState(false);
  const allMissionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SPECIALTY_STORAGE_KEY);
      if (stored && curriculum.specialties.some((specialty) => specialty.id === stored)) {
        setSelectedSpecialtyId(stored);
        setSelectedMissionId(firstSpecialtyMissionId(curriculum, stored));
        setHasSavedSpecialty(true);
      }
    } catch {
      // Ignore storage failures.
    }
  }, [curriculum]);

  const selectedSpecialty =
    curriculum.specialties.find((specialty) => specialty.id === selectedSpecialtyId) ?? curriculum.specialties[0];

  if (!selectedSpecialty) {
    return null;
  }

  const activeGrade = getActiveGradeLevel(curriculum);
  const commonModules = getCommonModules(curriculum, activeGrade);
  const specialtyModules = getSpecialtyModules(curriculum, selectedSpecialty.id, activeGrade);
  const specialtyGroups = getMissionsForModules(curriculum, specialtyModules);
  const commonGroups = getMissionsForModules(curriculum, commonModules);
  const specialtyMissions = specialtyGroups.flatMap((group) => group.missions);
  const allMissions = [...specialtyMissions, ...commonGroups.flatMap((group) => group.missions)];
  const recommendedMission =
    allMissions.find((mission) => mission.id === selectedMissionId) ?? specialtyMissions[0] ?? null;
  const relatedCourseIds = getCourseIdsForSpecialty(curriculum, selectedSpecialty.id, activeGrade).filter(
    (courseId) => courseLabels[courseId]
  );
  const prep = relatedCourseIds[0] ? prepByCourseId[relatedCourseIds[0]] ?? null : null;
  const showSpecialtyPicker = !isAuthenticated || !hasSavedSpecialty || changingDirection;

  function selectSpecialty(specialtyId: string) {
    setSelectedSpecialtyId(specialtyId);
    setSelectedMissionId(firstSpecialtyMissionId(curriculum, specialtyId));
    setChangingDirection(false);
    setHasSavedSpecialty(true);
    try {
      window.localStorage.setItem(SPECIALTY_STORAGE_KEY, specialtyId);
    } catch {
      // Ignore storage failures.
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{pathsTitle}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink/60">{copy.pathsSubtitle}</p>
      </div>

      {showSpecialtyPicker ? (
        <SpecialtySelector
          language={language}
          onSelect={selectSpecialty}
          selectedId={selectedSpecialty.id}
          specialties={curriculum.specialties}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
          <p className="text-sm font-bold text-ink/70">
            {copy.currentDirection}: {localizeCurriculumText(selectedSpecialty.title, language)}
          </p>
          <button
            className="text-sm font-semibold text-violet underline-offset-4 hover:underline"
            onClick={() => setChangingDirection(true)}
            type="button"
          >
            {copy.changeDirection}
          </button>
        </div>
      )}

      {recommendedMission ? (
        <StudentMissionCard
          language={language}
          mission={recommendedMission}
          onBrowseAll={() => allMissionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          prep={prep}
          specialty={selectedSpecialty}
        />
      ) : null}

      <div ref={allMissionsRef}>
        <MissionList
          accent={selectedSpecialty.accent}
          commonGroups={commonGroups}
          language={language}
          onSelect={setSelectedMissionId}
          selectedMission={recommendedMission}
          selectedMissionId={recommendedMission?.id ?? ""}
          specialtyGroups={specialtyGroups}
        />
      </div>

      <CurriculumDetails
        commonModules={commonModules}
        language={language}
        professionCode={selectedSpecialty.professionCode}
        specialtyModules={specialtyModules}
        specialtyTitle={selectedSpecialty.title}
      />

      <div className="flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/55">{copy.sourceLabel}</p>
        <a
          className="inline-flex items-center gap-2 text-sm font-bold text-violet hover:underline"
          href="https://pgknma.com/priem/"
          rel="noreferrer"
          target="_blank"
        >
          {copy.viewSource}
          <ExternalLink className="size-4" />
        </a>
      </div>
    </section>
  );
}
