import { gameQuests, type GameQuest } from "./game-data";
import type { GameProgress } from "./game-progress";
import type { Language } from "./i18n";
import { localizeGameQuest } from "./i18n";
import { fallbackCourseProjects } from "./projects/fallback-data";
import { getRequiredCertificateProjects, localizeProject } from "./projects/helpers";
import { getSubmissionForProject, isProjectRequirementMet } from "./projects/submissions";
import type { CourseProject, ProjectSubmissionRecord } from "./projects/types";
import type { ProgressRecord } from "./types";

export type CertificateBlocker =
  | { type: "lessons"; remaining: number }
  | { type: "project_submit"; projectId: string; projectTitle: string }
  | { type: "project_pending_review"; projectId: string; projectTitle: string }
  | { type: "project_needs_changes"; projectId: string; projectTitle: string };

export type QuestCertificate = {
  questId: string;
  title: string;
  badge: string;
  earned: boolean;
  earnedAt: string | null;
  completedCount: number;
  totalCount: number;
  blockers: CertificateBlocker[];
  inProgress: boolean;
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

export function getCertificateBlockers(
  quest: GameQuest,
  completedLessonIds: Iterable<string>,
  submissions: ProjectSubmissionRecord[],
  projects: CourseProject[],
  language: Language
): CertificateBlocker[] {
  const completed = new Set(completedLessonIds);
  const blockers: CertificateBlocker[] = [];
  const remainingLessons = quest.lessonIds.filter((lessonId) => !completed.has(lessonId)).length;

  if (remainingLessons > 0) {
    blockers.push({ type: "lessons", remaining: remainingLessons });
  }

  for (const project of getRequiredCertificateProjects(projects, quest.id)) {
    const localized = localizeProject(project, language);
    const submission = getSubmissionForProject(submissions, project.id);

    if (isProjectRequirementMet(project, submission)) {
      continue;
    }

    if (!submission?.submitted_at) {
      blockers.push({ type: "project_submit", projectId: project.id, projectTitle: localized.title });
      continue;
    }

    if (project.type === "capstone" && submission.status === "submitted") {
      blockers.push({ type: "project_pending_review", projectId: project.id, projectTitle: localized.title });
      continue;
    }

    if (project.type === "capstone" && submission.status === "needs_changes") {
      blockers.push({ type: "project_needs_changes", projectId: project.id, projectTitle: localized.title });
    }
  }

  return blockers;
}

function courseCertificateRequirementsMet(
  projects: CourseProject[],
  courseId: string,
  completedLessonIds: Iterable<string>,
  submissions: ProjectSubmissionRecord[]
) {
  const required = getRequiredCertificateProjects(projects, courseId);
  if (required.length === 0) {
    return true;
  }

  return required.every((project) => isProjectRequirementMet(project, getSubmissionForProject(submissions, project.id)));
}

function hasCourseCertificateActivity(
  quest: GameQuest,
  completedLessonIds: Iterable<string>,
  submissions: ProjectSubmissionRecord[],
  projects: CourseProject[]
) {
  const completed = new Set(completedLessonIds);
  const hasLessonProgress = quest.lessonIds.some((lessonId) => completed.has(lessonId));
  const projectIds = new Set(getRequiredCertificateProjects(projects, quest.id).map((project) => project.id));
  const hasProjectActivity = submissions.some(
    (submission) => projectIds.has(submission.project_id) && Boolean(submission.submitted_at)
  );

  return hasLessonProgress || hasProjectActivity;
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
    const blockers = earned ? [] : getCertificateBlockers(quest, completed, submissions, projects, language);
    const inProgress = !earned && hasCourseCertificateActivity(quest, completed, submissions, projects);

    return {
      questId: quest.id,
      title: localized.title,
      badge: localized.rewardBadge,
      earned,
      earnedAt: earned ? getQuestEarnedAt(quest, progressRecords) : null,
      completedCount,
      totalCount: quest.lessonIds.length,
      blockers,
      inProgress
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
