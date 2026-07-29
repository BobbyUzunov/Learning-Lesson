"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { CurriculumDetails } from "@/components/curriculum/curriculum-details";
import { MissionList } from "@/components/curriculum/mission-list";
import { SpecialtySelector } from "@/components/curriculum/specialty-selector";
import { StudentMissionCard } from "@/components/curriculum/student-mission-card";
import type {
  CurriculumExplorerCopy,
  CurriculumExplorerData
} from "@/lib/curriculum/explorer";

const SPECIALTY_STORAGE_KEY = "ll-selected-specialty";

type SchoolCurriculumExplorerProps = {
  copy: CurriculumExplorerCopy;
  data: CurriculumExplorerData;
  isAuthenticated: boolean;
  pathsTitle: string;
};

function firstSpecialtyMissionId(data: CurriculumExplorerData, specialtyId: string) {
  return data.specialties.find((specialty) => specialty.id === specialtyId)?.groups[0]?.missions[0]?.id ?? "";
}

export function SchoolCurriculumExplorer({
  copy,
  data,
  isAuthenticated,
  pathsTitle
}: SchoolCurriculumExplorerProps) {
  const fallbackSpecialtyId = data.specialties[0]?.id ?? "software-development";
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(fallbackSpecialtyId);
  const [selectedMissionId, setSelectedMissionId] = useState(() =>
    firstSpecialtyMissionId(data, fallbackSpecialtyId)
  );
  const [hasSavedSpecialty, setHasSavedSpecialty] = useState(false);
  const [changingDirection, setChangingDirection] = useState(false);
  const allMissionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SPECIALTY_STORAGE_KEY);
      if (stored && data.specialties.some((specialty) => specialty.id === stored)) {
        setSelectedSpecialtyId(stored);
        setSelectedMissionId(firstSpecialtyMissionId(data, stored));
        setHasSavedSpecialty(true);
      }
    } catch {
      // Ignore storage failures.
    }
  }, [data]);

  const selectedSpecialty =
    data.specialties.find((specialty) => specialty.id === selectedSpecialtyId) ?? data.specialties[0];

  if (!selectedSpecialty) {
    return null;
  }

  const specialtyGroups = selectedSpecialty.groups;
  const commonGroups = data.commonGroups;
  const specialtyMissions = specialtyGroups.flatMap((group) => group.missions);
  const allMissions = [...specialtyMissions, ...commonGroups.flatMap((group) => group.missions)];
  const recommendedMission =
    allMissions.find((mission) => mission.id === selectedMissionId) ?? specialtyMissions[0] ?? null;
  const showSpecialtyPicker = !isAuthenticated || !hasSavedSpecialty || changingDirection;

  function selectSpecialty(specialtyId: string) {
    setSelectedSpecialtyId(specialtyId);
    setSelectedMissionId(firstSpecialtyMissionId(data, specialtyId));
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
          copy={copy}
          onSelect={selectSpecialty}
          selectedId={selectedSpecialty.id}
          specialties={data.specialties}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
          <p className="text-sm font-bold text-ink/70">
            {copy.currentDirection}: {selectedSpecialty.title}
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
          copy={copy}
          mission={recommendedMission}
          onBrowseAll={() => allMissionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          specialty={selectedSpecialty}
        />
      ) : null}

      <div ref={allMissionsRef}>
        <MissionList
          accent={selectedSpecialty.accent}
          commonGroups={commonGroups}
          copy={copy}
          onSelect={setSelectedMissionId}
          selectedMission={recommendedMission}
          selectedMissionId={recommendedMission?.id ?? ""}
          specialtyGroups={specialtyGroups}
        />
      </div>

      <CurriculumDetails
        commonModules={commonGroups.map((group) => group.module)}
        copy={copy}
        professionCode={selectedSpecialty.professionCode}
        specialtyModules={specialtyGroups.map((group) => group.module)}
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
