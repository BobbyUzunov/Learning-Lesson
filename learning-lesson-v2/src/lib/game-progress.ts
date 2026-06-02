import { gameLessons, gameQuests, xpPerLesson, xpPerLevel } from "./game-data";
import type { ProgressRecord } from "./types";

export type GameProgress = {
  completedLessonIds: string[];
  currentStreak: number;
  lastCompletedAt: string | null;
};

const storageKey = "learning-lesson-v2-game-progress";

export function getStoredProgress(): GameProgress {
  if (typeof window === "undefined") {
    return { completedLessonIds: [], currentStreak: 0, lastCompletedAt: null };
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return { completedLessonIds: [], currentStreak: 0, lastCompletedAt: null };
  }

  try {
    return JSON.parse(raw) as GameProgress;
  } catch {
    return { completedLessonIds: [], currentStreak: 0, lastCompletedAt: null };
  }
}

export function saveStoredProgress(progress: GameProgress) {
  if (typeof window === "undefined") {
    return;
  }

  // TODO: Replace this local write with Supabase user_progress sync after auth roles are finalized.
  window.localStorage.setItem(storageKey, JSON.stringify(progress));
}

export function completeStoredLesson(lessonId: string) {
  const progress = getStoredProgress();
  const completedLessonIds = progress.completedLessonIds.includes(lessonId)
    ? progress.completedLessonIds
    : [...progress.completedLessonIds, lessonId];

  const nextProgress = {
    completedLessonIds,
    currentStreak: Math.max(1, progress.currentStreak || 0),
    lastCompletedAt: new Date().toISOString()
  };

  saveStoredProgress(nextProgress);
  return nextProgress;
}

export function getGameProgressStats(progress: GameProgress) {
  const completedCount = progress.completedLessonIds.length;
  const xp = completedCount * xpPerLesson;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const xpIntoLevel = xp % xpPerLevel;
  const firstIncompleteLesson = gameLessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? gameLessons[0];
  const currentQuest = gameQuests.find((quest) => quest.id === firstIncompleteLesson.questId) ?? gameQuests[0];

  return {
    completedCount,
    currentMission: firstIncompleteLesson,
    currentQuest,
    currentStreak: progress.currentStreak,
    level,
    xp,
    xpGoal: xpPerLevel,
    xpIntoLevel,
    xpPercent: Math.round((xpIntoLevel / xpPerLevel) * 100)
  };
}

export function toGameProgress(progress: ProgressRecord[]): GameProgress {
  return {
    completedLessonIds: progress.filter((item) => item.completed).map((item) => item.lesson_id),
    currentStreak: progress.some((item) => item.completed) ? 1 : 0,
    lastCompletedAt:
      progress
        .map((item) => item.completed_at)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null
  };
}
