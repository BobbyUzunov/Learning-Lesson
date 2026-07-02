import { gameQuests, type GameQuest } from "./game-data";
import type { GameProgress } from "./game-progress";
import type { Language } from "./i18n";
import { localizeGameQuest } from "./i18n";
import { courseCertificateRequirementsMet } from "./projects";
import type { ProgressRecord } from "./types";

export type QuestCertificate = {
  questId: string;
  title: string;
  badge: string;
  earned: boolean;
  earnedAt: string | null;
  completedCount: number;
  totalCount: number;
};

function getQuestEarnedAt(quest: GameQuest, progress: ProgressRecord[]) {
  const completedRecords = quest.lessonIds
    .map((lessonId) => progress.find((item) => item.lesson_id === lessonId && item.completed))
    .filter(Boolean);

  if (completedRecords.length < quest.lessonIds.length) {
    return null;
  }

  const timestamps = completedRecords
    .map((item) => item?.completed_at)
    .filter((value): value is string => Boolean(value))
    .sort();

  return timestamps.at(-1) ?? null;
}

export function getQuestCertificates(
  gameProgress: GameProgress,
  language: Language,
  progressRecords: ProgressRecord[] = [],
  submittedProjectIds: string[] = []
): QuestCertificate[] {
  const completed = new Set(gameProgress.completedLessonIds);

  return gameQuests.map((quest) => {
    const localized = localizeGameQuest(quest, language);
    const completedCount = quest.lessonIds.filter((lessonId) => completed.has(lessonId)).length;
    const lessonsComplete = completedCount === quest.lessonIds.length;
    const projectsComplete = courseCertificateRequirementsMet(quest.id, completed, submittedProjectIds);
    const earned = lessonsComplete && projectsComplete;

    return {
      questId: quest.id,
      title: localized.title,
      badge: localized.rewardBadge,
      earned,
      earnedAt: earned ? getQuestEarnedAt(quest, progressRecords) : null,
      completedCount,
      totalCount: quest.lessonIds.length
    };
  });
}

export function getEarnedCertificates(
  gameProgress: GameProgress,
  language: Language,
  progressRecords: ProgressRecord[] = [],
  submittedProjectIds: string[] = []
) {
  return getQuestCertificates(gameProgress, language, progressRecords, submittedProjectIds).filter(
    (certificate) => certificate.earned
  );
}
