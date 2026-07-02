import { gameQuests, type GameQuest } from "./game-data";
import type { GameProgress } from "./game-progress";
import type { Language } from "./i18n";
import { localizeGameQuest } from "./i18n";
import { fallbackCourseProjects } from "./projects/fallback-data";
import { courseCertificateRequirementsMet } from "./projects/helpers";
import type { CourseProject, ProjectSubmissionRecord } from "./projects/types";
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
  submissions: ProjectSubmissionRecord[] = [],
  courses: GameQuest[] = gameQuests,
  projects: CourseProject[] = fallbackCourseProjects
): QuestCertificate[] {
  const completed = new Set(gameProgress.completedLessonIds);

  return courses.map((quest) => {
    const localized = localizeGameQuest(quest, language);
    const completedCount = quest.lessonIds.filter((lessonId) => completed.has(lessonId)).length;
    const lessonsComplete = completedCount === quest.lessonIds.length;
    const projectsComplete = courseCertificateRequirementsMet(projects, quest.id, completed, submissions);
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
  submissions: ProjectSubmissionRecord[] = [],
  courses: GameQuest[] = gameQuests,
  projects: CourseProject[] = fallbackCourseProjects
) {
  return getQuestCertificates(gameProgress, language, progressRecords, submissions, courses, projects).filter(
    (certificate) => certificate.earned
  );
}
