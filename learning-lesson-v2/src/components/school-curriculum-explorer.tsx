"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { CurriculumDetails } from "@/components/curriculum/curriculum-details";
import { MissionList } from "@/components/curriculum/mission-list";
import { SpecialtySelector } from "@/components/curriculum/specialty-selector";
import { StudentMissionCard } from "@/components/curriculum/student-mission-card";
import {
  applyGuestLessonProgress,
  resolveStudentProgramSpecialtyId,
  type CurriculumExplorerCopy,
  type CurriculumExplorerData
} from "@/lib/curriculum/explorer";
import { getStoredProgress } from "@/lib/game-progress-storage";

/*
 * `data` is the trusted server snapshot. Guests layer their normalized local
 * lesson IDs over it after hydration; authenticated learners never do.
 */
type SchoolCurriculumExplorerProps = {
  copy: CurriculumExplorerCopy;
  data: CurriculumExplorerData;
  isAuthenticated: boolean;
  lockedSpecialtyId?: string | null;
};

const SPECIALTY_STORAGE_KEY = "ll-selected-specialty";

function firstSpecialtyMissionId(data: CurriculumExplorerData, specialtyId: string) {
  return data.specialties.find((specialty) => specialty.id === specialtyId)?.groups[0]?.missions[0]?.id ?? "";
}

export function SchoolCurriculumExplorer({
  copy,
  data,
  isAuthenticated,
  lockedSpecialtyId = null
}: SchoolCurriculumExplorerProps) {
  const initial = resolveStudentProgramSpecialtyId(data.specialties, lockedSpecialtyId, null);
  const fallbackSpecialtyId = initial.specialtyId || data.specialties[0]?.id || "software-development";
  const [selection, setSelection] = useState(() => ({
    specialtyId: fallbackSpecialtyId,
    missionId: firstSpecialtyMissionId(data, fallbackSpecialtyId)
  }));
  const [savedSpecialtyId, setSavedSpecialtyId] = useState<string | null>(
    initial.locked ? fallbackSpecialtyId : null
  );
  const [guestCompletedLessonIds, setGuestCompletedLessonIds] = useState<string[] | null>(null);
  const [changingDirection, setChangingDirection] = useState(false);
  const allMissionsRef = useRef<HTMLDivElement>(null);
  const firstMissionBySpecialty = useMemo(
    () =>
      new Map(
        data.specialties.map((specialty) => [
          specialty.id,
          specialty.groups[0]?.missions[0]?.id ?? ""
        ])
      ),
    [data.specialties]
  );

  useEffect(() => {
    const locked = resolveStudentProgramSpecialtyId(data.specialties, lockedSpecialtyId, null);
    if (locked.locked) {
      setSelection({
        specialtyId: locked.specialtyId,
        missionId: firstMissionBySpecialty.get(locked.specialtyId) ?? ""
      });
      setSavedSpecialtyId(locked.specialtyId);
      setChangingDirection(false);
      return;
    }

    try {
      const stored = window.localStorage.getItem(SPECIALTY_STORAGE_KEY);
      const missionId = stored ? firstMissionBySpecialty.get(stored) : undefined;
      if (stored && missionId !== undefined) {
        setSelection({ specialtyId: stored, missionId });
        setSavedSpecialtyId(stored);
      }
    } catch {
      // Ignore storage failures.
    }
  }, [firstMissionBySpecialty, lockedSpecialtyId, data.specialties]);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    try {
      setGuestCompletedLessonIds(getStoredProgress().completedLessonIds);
    } catch {
      setGuestCompletedLessonIds([]);
    }
  }, [isAuthenticated]);

  const displayData = useMemo(
    () =>
      !isAuthenticated && guestCompletedLessonIds
        ? applyGuestLessonProgress(data, guestCompletedLessonIds)
        : data,
    [data, guestCompletedLessonIds, isAuthenticated]
  );

  const selectedSpecialty =
    displayData.specialties.find((specialty) => specialty.id === selection.specialtyId) ??
    displayData.specialties[0];

  if (!selectedSpecialty) {
    return null;
  }

  const specialtyGroups = selectedSpecialty.groups;
  const commonGroups = displayData.commonGroups;
  const specialtyMissions = specialtyGroups.flatMap((group) => group.missions);
  const recommendedMission =
    specialtyMissions.find((mission) => mission.id === selection.missionId) ?? specialtyMissions[0] ?? null;
  const directionLocked = Boolean(lockedSpecialtyId);
  const hasSavedSpecialty = savedSpecialtyId === selectedSpecialty.id;
  const showSpecialtyPicker = !directionLocked && (!isAuthenticated || !hasSavedSpecialty || changingDirection);

  function selectSpecialty(specialtyId: string) {
    setSelection({
      specialtyId,
      missionId: firstMissionBySpecialty.get(specialtyId) ?? ""
    });
    setChangingDirection(false);
    setSavedSpecialtyId(specialtyId);
    try {
      window.localStorage.setItem(SPECIALTY_STORAGE_KEY, specialtyId);
    } catch {
      // Ignore storage failures.
    }
  }

  return (
    <section className="space-y-8">
      {showSpecialtyPicker ? (
        <SpecialtySelector
          copy={copy}
          onSelect={selectSpecialty}
          selectedId={selectedSpecialty.id}
          specialties={displayData.specialties}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
          <p className="text-sm font-bold text-ink/70">
            {copy.currentDirection}: {selectedSpecialty.title}
          </p>
          {directionLocked ? (
            <p className="text-sm text-ink/45">{copy.directionFromClass}</p>
          ) : (
            <button
              className="text-sm font-semibold text-violet underline-offset-4 hover:underline"
              onClick={() => setChangingDirection(true)}
              type="button"
            >
              {copy.changeDirection}
            </button>
          )}
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
          commonGroups={[]}
          copy={copy}
          onSelect={(missionId) => setSelection((current) => ({ ...current, missionId }))}
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
