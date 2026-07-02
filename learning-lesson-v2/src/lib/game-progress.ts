import { gameLessons, gameQuests, xpPerLesson, xpPerLevel } from "./game-data";
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

export function getGameProgressStats(progress: GameProgress) {
  const completedCount = progress.completedLessonIds.length;
  const xp = completedCount * xpPerLesson;
  const levelInfo = getLevelProgress(xp);
  const firstIncompleteLesson = gameLessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? gameLessons[0];
  const currentQuest = gameQuests.find((quest) => quest.id === firstIncompleteLesson.questId) ?? gameQuests[0];

  return {
    completedCount,
    currentMission: firstIncompleteLesson,
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

export function getAchievements(progress: GameProgress, streakDays = progress.currentStreak): Achievement[] {
  const completed = progress.completedLessonIds;
  const xp = completed.length * xpPerLesson;
  const hasCompletedQuest = (questId: string) => {
    const quest = gameQuests.find((item) => item.id === questId);
    return Boolean(quest && quest.lessonIds.every((lessonId) => completed.includes(lessonId)));
  };

  return [
    {
      id: "first-login",
      title: "First Login",
      description: "Account created and ready to learn.",
      unlocked: true
    },
    {
      id: "first-mission",
      title: "First Mission",
      description: "Complete your first mission.",
      unlocked: completed.length >= 1
    },
    {
      id: "first-path",
      title: "First Path",
      description: "Start a learning path.",
      unlocked: completed.length >= 1
    },
    {
      id: "100-xp",
      title: "100 XP",
      description: "Earn your first 100 XP.",
      unlocked: xp >= 100
    },
    {
      id: "500-xp",
      title: "500 XP",
      description: "Reach 500 XP.",
      unlocked: xp >= 500
    },
    {
      id: "7-day-streak",
      title: "7 Day Streak",
      description: "Visit and learn for 7 days.",
      unlocked: streakDays >= 7
    },
    {
      id: "full-frontend",
      title: "Full Frontend Path",
      description: "Complete all available Frontend missions.",
      unlocked: hasCompletedQuest("frontend")
    },
    {
      id: "ai-builder-started",
      title: "AI Builder Started",
      description: "Start the AI Product Builder path.",
      unlocked: completed.includes("7")
    }
  ];
}
