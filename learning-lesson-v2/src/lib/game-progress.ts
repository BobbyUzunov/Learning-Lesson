import { gameLessons, gameQuests, getGameLesson, getGlobalNextLesson, xpPerLesson, xpPerLevel, type GameLesson, type GameQuest } from "./game-data";
import type { Language } from "./i18n";
import { t } from "./i18n";
import type { ProgressRecord } from "./types";

export type GameProgress = {
  completedLessonIds: string[];
  currentStreak: number;
  lastCompletedAt: string | null;
};

const storageKey = "learning-lesson-v2-game-progress";
export const guestContinueKey = "learning-lesson-v2-guest-continue";

export const levelThresholds = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 }
];

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

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

export function clearStoredProgress() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}

export function getGameProgressStats(
  progress: GameProgress,
  lessons: GameLesson[] = gameLessons,
  courses: GameQuest[] = gameQuests
) {
  const completedCount = progress.completedLessonIds.length;
  const xp = completedCount * xpPerLesson;
  const levelInfo = getLevelProgress(xp);
  const nextLessonId = getGlobalNextLesson(progress.completedLessonIds);
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const currentMission = (nextLessonId ? lessonById.get(nextLessonId) ?? getGameLesson(nextLessonId) : lessons[0]) ?? lessons[0];
  const currentQuest = courses.find((quest) => quest.id === currentMission.questId) ?? courses[0];
  const courseCompleted = currentQuest.lessonIds.filter((id) => progress.completedLessonIds.includes(id)).length;
  const courseTotal = currentQuest.lessonIds.length;
  const coursePercent = courseTotal ? Math.round((courseCompleted / courseTotal) * 100) : 0;

  return {
    completedCount,
    courseCompleted,
    coursePercent,
    courseTotal,
    currentMission,
    currentQuest,
    currentStreak: progress.currentStreak,
    level: levelInfo.level,
    nextReward: levelInfo.nextReward,
    xp,
    xpGoal: levelInfo.nextThreshold,
    xpIntoLevel: levelInfo.xpIntoLevel,
    xpPercent: levelInfo.percent
  };
}

export function toGameProgress(progress: ProgressRecord[], streakCount?: number): GameProgress {
  return {
    completedLessonIds: progress.filter((item) => item.completed).map((item) => item.lesson_id),
    currentStreak: streakCount ?? (progress.some((item) => item.completed) ? 1 : 0),
    lastCompletedAt:
      progress
        .map((item) => item.completed_at)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null
  };
}

export function getLevelProgress(xp: number) {
  const current = [...levelThresholds].reverse().find((item) => xp >= item.xp) ?? levelThresholds[0];
  const next = levelThresholds.find((item) => item.xp > xp);
  const previousXp = current.xp;
  const nextXp = next?.xp ?? Math.max(previousXp + xpPerLevel, xp + xpPerLesson);
  const span = Math.max(1, nextXp - previousXp);
  const xpIntoLevel = Math.max(0, xp - previousXp);

  return {
    level: current.level,
    nextLevel: next?.level ?? current.level + 1,
    nextReward: next ? `Level ${next.level}` : "Bonus XP",
    nextThreshold: nextXp,
    percent: Math.min(100, Math.round((xpIntoLevel / span) * 100)),
    xpIntoLevel,
    xpToNext: Math.max(0, nextXp - xp)
  };
}

export function getCurrentPath(progress: GameProgress) {
  const stats = getGameProgressStats(progress);
  return stats.currentQuest;
}

export function getAchievements(
  progress: GameProgress,
  language: Language = "en",
  streakDays = progress.currentStreak
): Achievement[] {
  const completed = progress.completedLessonIds;
  const xp = completed.length * xpPerLesson;
  const copy = t(language);
  const hasCompletedQuest = (questId: string) => {
    const quest = gameQuests.find((item) => item.id === questId);
    return Boolean(quest && quest.lessonIds.every((lessonId) => completed.includes(lessonId)));
  };

  const definitions = [
    { id: "first-login", unlocked: true },
    { id: "first-mission", unlocked: completed.length >= 1 },
    { id: "first-path", unlocked: completed.length >= 1 },
    { id: "100-xp", unlocked: xp >= 100 },
    { id: "500-xp", unlocked: xp >= 500 },
    { id: "7-day-streak", unlocked: streakDays >= 7 },
    { id: "full-frontend", unlocked: hasCompletedQuest("frontend") },
    { id: "ai-builder-started", unlocked: completed.includes("7") }
  ] as const;

  return definitions.map((item) => {
    const localized = copy.achievements[item.id];
    return {
      id: item.id,
      title: localized.title,
      description: localized.description,
      unlocked: item.unlocked
    };
  });
}
