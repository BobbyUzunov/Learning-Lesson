"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Lock, Rocket } from "lucide-react";
import type { CourseCatalog } from "@/lib/catalog/types";
import {
  getLessonFromCatalog,
  getNextLessonInQuest,
  isLessonUnlocked
} from "@/lib/catalog/helpers";
import { getStoredProgress } from "@/lib/game-progress";
import { xpPerLesson } from "@/lib/game-data";
import {
  getProjectsForCourse,
  isProjectSubmitted,
  isProjectUnlocked,
  localizeProject
} from "@/lib/projects";
import { formatLessonsProgress, formatMessage, localizeGameLesson, localizeGameQuest, t, type Language } from "@/lib/i18n";
import { getLessonModuleIndex } from "@/lib/lesson-structure";

export function SyllabusView({
  catalog,
  completedLessonIds: initialCompletedLessonIds,
  isAuthenticated,
  showGuestLockMessage = false,
  showLessonLockMessage = false,
  submittedProjectIds: initialSubmittedProjectIds = [],
  language
}: {
  catalog: CourseCatalog;
  completedLessonIds?: string[];
  isAuthenticated: boolean;
  showGuestLockMessage?: boolean;
  showLessonLockMessage?: boolean;
  submittedProjectIds?: string[];
  language: Language;
}) {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(initialCompletedLessonIds ?? []);
  const [submittedProjectIds, setSubmittedProjectIds] = useState<string[]>(initialSubmittedProjectIds);
  const [expandedCourseId, setExpandedCourseId] = useState<string>("frontend");
  const [lockMessage, setLockMessage] = useState<string | null>(() => {
    if (!isAuthenticated && showGuestLockMessage) {
      return t(language).paths.guestLockMessage;
    }
    if (isAuthenticated && showLessonLockMessage) {
      return t(language).paths.lessonLockMessage;
    }
    return null;
  });
  const copy = t(language);

  useEffect(() => {
    if (showGuestLockMessage && !isAuthenticated) {
      setLockMessage(copy.paths.guestLockMessage);
      return;
    }

    if (showLessonLockMessage && isAuthenticated) {
      setLockMessage(copy.paths.lessonLockMessage);
      return;
    }

    if (isAuthenticated) {
      setLockMessage(null);
      return;
    }

    if (!initialCompletedLessonIds) {
      setCompletedLessonIds(getStoredProgress().completedLessonIds);
    }

    if (isAuthenticated) {
      setSubmittedProjectIds(initialSubmittedProjectIds);
    }
  }, [
    copy.paths.guestLockMessage,
    copy.paths.lessonLockMessage,
    initialCompletedLessonIds,
    initialSubmittedProjectIds,
    isAuthenticated,
    showGuestLockMessage,
    showLessonLockMessage
  ]);

  return (
    <div className="mt-8 space-y-5">
      {!isAuthenticated ? (
        <p className="rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">{copy.paths.guestFreeLesson}</p>
      ) : null}
      {lockMessage ? (
        <p className="rounded-md bg-violet/15 px-4 py-3 text-sm font-bold text-ink">{lockMessage}</p>
      ) : null}

      {catalog.courses.map((rawQuest) => {
        const quest = localizeGameQuest(rawQuest, language);
        const completed = quest.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
        const progress = Math.round((completed / quest.lessonIds.length) * 100);
        const nextLesson = getNextLessonInQuest(catalog, quest.id, completedLessonIds);
        const isExpanded = expandedCourseId === quest.id;
        const hasStarted = completed > 0;
        const isGuestAllowedQuest = quest.id === "frontend" && nextLesson === "1";
        const guestLocked = !isAuthenticated && !isGuestAllowedQuest;
        const courseHref = nextLesson ? `/lesson/${nextLesson}` : "/paths";

        return (
          <article className="overflow-hidden rounded-lg border border-ink/10 bg-white/85 shadow-sm" key={quest.id}>
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <button
                className="flex flex-1 items-start gap-3 text-left"
                onClick={() => setExpandedCourseId(isExpanded ? "" : quest.id)}
                type="button"
              >
                <span className="mt-1 rounded-md bg-violet/10 p-2 text-violet">
                  {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase text-violet">{quest.difficulty}</span>
                  <span className="mt-1 block text-2xl font-black">{quest.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-ink/70">{quest.description}</span>
                  <span className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-ink/60">
                    <span className="rounded-md bg-ink/5 px-2 py-1">
                      {formatLessonsProgress(language, completed, quest.lessonIds.length)}
                    </span>
                    <span className="rounded-md bg-ink/5 px-2 py-1">
                      {copy.paths.timeLabel}: {quest.estimatedTime}
                    </span>
                    <span className="rounded-md bg-ink/5 px-2 py-1">
                      {xpPerLesson} XP / {copy.syllabus.moduleSingular}
                    </span>
                  </span>
                </span>
              </button>

              <div className="flex w-full flex-col gap-3 lg:w-56">
                <div>
                  <div className="flex justify-between text-sm font-bold text-ink/70">
                    <span>{copy.syllabus.courseProgress}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-ink/10">
                    <div className="h-2.5 rounded-full bg-violet transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {guestLocked ? (
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 bg-ink/5 px-4 py-2 text-sm font-bold text-ink/70"
                    onClick={() => setLockMessage(copy.paths.guestLockMessage)}
                    type="button"
                  >
                    {copy.common.locked}
                  </button>
                ) : (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper transition hover:bg-ink/90"
                    href={courseHref}
                  >
                    {hasStarted ? copy.paths.continueCourse : copy.paths.startCourse}
                    <ChevronRight className="size-4" />
                  </Link>
                )}
              </div>
            </div>

            {isExpanded ? (
              <div className="border-t border-ink/10 bg-ink/[0.02] px-5 py-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/50">{copy.syllabus.programTitle}</p>
                <ol className="space-y-2">
                  {quest.lessonIds.map((lessonId) => {
                    const rawLesson = getLessonFromCatalog(catalog, lessonId);
                    if (!rawLesson) {
                      return null;
                    }

                    const lesson = localizeGameLesson(rawLesson, language);
                    const moduleNumber = getLessonModuleIndex(lessonId, quest.id);
                    const isCompleted = completedLessonIds.includes(lessonId);
                    const unlocked =
                      isCompleted ||
                      (isAuthenticated
                        ? isLessonUnlocked(catalog, lessonId, completedLessonIds)
                        : quest.id === "frontend" && lessonId === "1");
                    const isCurrent = nextLesson === lessonId;

                    return (
                      <li key={lessonId}>
                        {unlocked ? (
                          <Link
                            className={`flex items-center gap-3 rounded-md border px-3 py-3 transition hover:border-violet/30 hover:bg-white ${
                              isCurrent ? "border-violet/40 bg-white shadow-sm" : "border-ink/10 bg-white/70"
                            }`}
                            href={`/lesson/${lessonId}`}
                          >
                            <ModuleStatus completed={isCompleted} current={isCurrent} />
                            <span className="min-w-0 flex-1">
                              <span className="text-xs font-bold uppercase text-ink/45">
                                {formatMessage(copy.syllabus.moduleLabel, {
                                  current: moduleNumber,
                                  total: quest.lessonIds.length
                                })}
                              </span>
                              <span className="mt-0.5 block font-bold text-ink">{lesson.title}</span>
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-ink/35" />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-ink/5 px-3 py-3 text-ink/55">
                            <Lock className="size-4 shrink-0" />
                            <span className="min-w-0 flex-1">
                              <span className="text-xs font-bold uppercase">
                                {formatMessage(copy.syllabus.moduleLabel, {
                                  current: moduleNumber,
                                  total: quest.lessonIds.length
                                })}
                              </span>
                              <span className="mt-0.5 block font-bold">{lesson.title}</span>
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {getProjectsForCourse(quest.id).map((rawProject) => {
                    const project = localizeProject(rawProject, language);
                    const submitted = isProjectSubmitted(project.id, submittedProjectIds);
                    const unlocked = isAuthenticated && isProjectUnlocked(rawProject, completedLessonIds);

                    return (
                      <li key={project.id}>
                        {unlocked ? (
                          <Link
                            className={`flex items-center gap-3 rounded-md border px-3 py-3 transition hover:border-coral/30 hover:bg-white ${
                              submitted ? "border-mint/30 bg-mint/10" : "border-coral/20 bg-coral/5"
                            }`}
                            href={`/projects/${project.id}`}
                          >
                            {submitted ? (
                              <CheckCircle2 className="size-5 shrink-0 text-mint" />
                            ) : (
                              <Rocket className="size-5 shrink-0 text-coral" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="text-xs font-bold uppercase text-coral">{copy.projects.badge}</span>
                              <span className="mt-0.5 block font-bold text-ink">{project.title}</span>
                              {submitted ? (
                                <span className="mt-1 block text-xs font-semibold text-mint">{copy.projects.submittedLabel}</span>
                              ) : null}
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-ink/35" />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-ink/5 px-3 py-3 text-ink/55">
                            <Lock className="size-4 shrink-0" />
                            <span className="min-w-0 flex-1">
                              <span className="text-xs font-bold uppercase text-coral">{copy.projects.badge}</span>
                              <span className="mt-0.5 block font-bold">{project.title}</span>
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ModuleStatus({ completed, current }: { completed: boolean; current: boolean }) {
  if (completed) {
    return <CheckCircle2 className="size-5 shrink-0 text-mint" />;
  }

  if (current) {
    return <Circle className="size-5 shrink-0 fill-violet/20 text-violet" />;
  }

  return <Circle className="size-5 shrink-0 text-ink/25" />;
}
