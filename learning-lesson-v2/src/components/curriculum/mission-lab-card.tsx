"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, FlaskConical, Trophy } from "lucide-react";
import type { QuestCertificate } from "@/lib/certificates";
import type { ResolvedCurriculumMissionLab } from "@/lib/curriculum/labs";
import { xpPerLesson } from "@/lib/game-data";
import { getStoredProgress } from "@/lib/game-progress-storage";
import { formatMessage, localizeGameLesson, localizeGameQuest, t, type Language } from "@/lib/i18n";

export function MissionLabCard({
  certificate,
  isAuthenticated,
  lab,
  language
}: {
  certificate: QuestCertificate | null;
  isAuthenticated: boolean;
  lab: ResolvedCurriculumMissionLab;
  language: Language;
}) {
  const copy = t(language).schoolCurriculum;
  const lesson = localizeGameLesson(lab.lesson, language);
  const course = localizeGameQuest(lab.course, language);
  const [guestCompletedLessonIds, setGuestCompletedLessonIds] = useState<string[] | null>(null);

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

  const guestCompletedLessons = useMemo(
    () => new Set(guestCompletedLessonIds ?? []),
    [guestCompletedLessonIds]
  );
  const lessonCompleted = isAuthenticated ? lab.completed : guestCompletedLessons.has(lab.lesson.id);
  const completedCount = isAuthenticated
    ? certificate?.completedCount ?? 0
    : lab.course.lessonIds.filter((lessonId) => guestCompletedLessons.has(lessonId)).length;
  const totalCount = certificate?.totalCount ?? lab.course.lessonIds.length;
  const coursePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const lessonHref =
    isAuthenticated || lab.lesson.id === "1"
      ? `/lesson/${lab.lesson.id}`
      : `/login?redirect=${encodeURIComponent(`/lesson/${lab.lesson.id}`)}`;

  return (
    <section className="rounded-3xl border border-coral/25 bg-coral/5 p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-coral">
        <FlaskConical className="size-4" />
        {copy.technologyLabTitle}
      </p>
      <h2 className="mt-3 text-xl font-bold">{course.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">{copy.technologyLabHint}</p>

      <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{copy.labLessonLabel}</p>
        <p className="mt-2 font-bold">{lesson.title}</p>
        <p aria-live="polite" className="mt-3 text-xs font-bold text-ink/60">
          {lessonCompleted ? copy.labCompleted : copy.labAvailable}
          <span aria-hidden="true"> · </span>
          {Number(lessonCompleted)}/1
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-ink/70">
          {lessonCompleted ? <CheckCircle2 className="size-4 text-mint" /> : <Award className="size-4 text-coral" />}
          {formatMessage(lessonCompleted ? copy.labXpEarned : copy.labXpAvailable, { xp: xpPerLesson })}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-ink/60">
          <span>
            {formatMessage(copy.labCourseLessonProgress, {
              completed: completedCount,
              total: totalCount
            })}
          </span>
          <span>{coursePercent}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-ink/10">
          <div className="h-2 rounded-full bg-coral" style={{ width: `${coursePercent}%` }} />
        </div>
      </div>

      {certificate?.earned ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-mint/20 px-3 py-1.5 text-xs font-bold text-ink">
          <Trophy className="size-4 text-coral" />
          {copy.labCertificateEarned}
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-ink/55">{copy.labNoMissionXp}</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {!lessonCompleted ? (
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper"
            href={lessonHref}
          >
            {copy.openLab}
          </Link>
        ) : null}
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink"
          href={certificate?.earned ? `/certificate/${lab.course.id}` : `/paths?tab=labs#course-${lab.course.id}`}
        >
          {certificate?.earned ? copy.openLabCertificate : copy.openLabCourse}
        </Link>
      </div>
    </section>
  );
}
