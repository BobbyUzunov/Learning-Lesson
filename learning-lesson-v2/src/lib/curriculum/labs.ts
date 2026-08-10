import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import type { CourseCatalog } from "@/lib/catalog/types";
import type { GameLesson, GameQuest } from "@/lib/game-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { fallbackCurriculumMissionLabs } from "./labs-data";
import type { CurriculumMissionLab, CurriculumMissionLabRow } from "./types";

const missionLabColumns = "mission_id, lesson_id, sort_order";

export type ResolvedCurriculumMissionLab = CurriculumMissionLab & {
  lesson: GameLesson;
  course: GameQuest;
  completed: boolean;
};

export function mapCurriculumMissionLabRows(rows: CurriculumMissionLabRow[]): CurriculumMissionLab[] {
  return rows
    .map((row) => ({
      missionId: row.mission_id,
      lessonId: row.lesson_id,
      sortOrder: row.sort_order
    }))
    .sort((left, right) => left.missionId.localeCompare(right.missionId) || left.sortOrder - right.sortOrder);
}

async function loadCurriculumMissionLabsFromDatabase(): Promise<CurriculumMissionLab[] | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculum_mission_labs")
    .select(missionLabColumns)
    .order("mission_id")
    .order("sort_order");

  if (error || !data || data.length === 0) {
    return null;
  }

  return mapCurriculumMissionLabRows(data as CurriculumMissionLabRow[]);
}

async function loadCurriculumMissionLabs() {
  return (await loadCurriculumMissionLabsFromDatabase()) ?? fallbackCurriculumMissionLabs;
}

export const getCurriculumMissionLabs = cache(loadCurriculumMissionLabs);

export function getMissionLabLinks(links: CurriculumMissionLab[], missionId: string) {
  return links
    .filter((link) => link.missionId === missionId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function resolveCurriculumMissionLabs(
  links: CurriculumMissionLab[],
  catalog: CourseCatalog,
  missionId: string,
  completedLessonIds: Iterable<string> = []
): ResolvedCurriculumMissionLab[] {
  const completed = new Set(completedLessonIds);

  return getMissionLabLinks(links, missionId).flatMap((link) => {
    const lesson = catalog.lessons.find((entry) => entry.id === link.lessonId);
    if (!lesson) {
      return [];
    }

    const course = catalog.courses.find((entry) => entry.id === lesson.questId);
    if (!course) {
      return [];
    }

    return [{ ...link, lesson, course, completed: completed.has(link.lessonId) }];
  });
}

export { fallbackCurriculumMissionLabs } from "./labs-data";
