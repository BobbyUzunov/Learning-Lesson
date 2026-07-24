"use client";

import { useRef, useState } from "react";
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
  getSpecialtyModules
} from "@/lib/curriculum/helpers";
import type { SchoolCurriculum } from "@/lib/curriculum/types";
import { t, type Language } from "@/lib/i18n";

type SchoolCurriculumExplorerProps = {
  courseLabels: Record<string, string>;
  curriculum: SchoolCurriculum;
  isAuthenticated: boolean;
  language: Language;
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
  language
}: SchoolCurriculumExplorerProps) {
  const copy = t(language).schoolCurriculum;
  const initialSpecialtyId = curriculum.specialties[0]?.id ?? "software-development";
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(initialSpecialtyId);
  const [selectedMissionId, setSelectedMissionId] = useState(() =>
    firstSpecialtyMissionId(curriculum, initialSpecialtyId)
  );
  const allMissionsRef = useRef<HTMLDivElement>(null);

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

  function selectSpecialty(specialtyId: string) {
    setSelectedSpecialtyId(specialtyId);
    setSelectedMissionId(firstSpecialtyMissionId(curriculum, specialtyId));
  }

  function browseAllMissions() {
    allMissionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.pathsTitle}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink/60">{copy.pathsSubtitle}</p>
      </div>

      <SpecialtySelector
        language={language}
        onSelect={selectSpecialty}
        selectedId={selectedSpecialty.id}
        specialties={curriculum.specialties}
      />

      {recommendedMission ? (
        <StudentMissionCard
          firstCourseId={relatedCourseIds[0]}
          language={language}
          mission={recommendedMission}
          onBrowseAll={browseAllMissions}
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
