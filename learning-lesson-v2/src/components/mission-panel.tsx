"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Lightbulb, Lock, ScrollText } from "lucide-react";
import type { GameLesson } from "@/lib/game-data";
import type { GameQuest } from "@/lib/game-data";
import { getGlobalNextLessonFromCourses } from "@/lib/catalog/helpers";
import { completeStoredLesson, getGameProgressStats, getStoredProgress, guestContinueKey } from "@/lib/game-progress";
import { formatMessage, t, type Language } from "@/lib/i18n";

const MIN_EFFORT_CHARS = 12;

export function MissionPanel({
  completedLessonIds = [],
  courses,
  isAuthenticated,
  language,
  lesson
}: {
  completedLessonIds?: string[];
  courses: GameQuest[];
  isAuthenticated: boolean;
  language: Language;
  lesson: GameLesson;
}) {
  const [solutionInput, setSolutionInput] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const router = useRouter();
  const copy = t(language);
  const lessonHints = [lesson.hint1, lesson.hint2, lesson.hint3].filter((hint): hint is string => Boolean(hint?.trim()));
  const effortChars = solutionInput.trim().length;
  const hasEffort = effortChars >= MIN_EFFORT_CHARS;
  const allHintsUsed = hintsUsed >= lessonHints.length;
  const canViewSolution = hasEffort || allHintsUsed;

  function resolveNextLesson(updatedCompletedIds: string[]) {
    return getGlobalNextLessonFromCourses(courses, updatedCompletedIds);
  }

  function finishMissionSuccess(level: number, updatedCompletedIds: string[], options?: { showGuestModal?: boolean }) {
    const nextId = resolveNextLesson(updatedCompletedIds);
    setNextLessonId(nextId);
    setJustCompleted(true);
    setMessage(`${copy.lesson.completeMessage} ${level}.`);
    router.refresh();

    if (options?.showGuestModal) {
      setShowGuestModal(true);
      return;
    }

    if (nextId) {
      window.setTimeout(() => router.push(`/lesson/${nextId}`), 1800);
    }
  }

  async function completeMission() {
    if (!hasEffort && !allHintsUsed) {
      setMessage(copy.lesson.completeBeforeFinish);
      return;
    }

    setLoading(true);
    setMessage(null);

    if (!isAuthenticated) {
      const progress = completeStoredLesson(lesson.id);
      const stats = getGameProgressStats(progress);
      finishMissionSuccess(stats.level, progress.completedLessonIds, {
        showGuestModal: lesson.id === "1"
      });
      setLoading(false);
      return;
    }

    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id })
    });

    setLoading(false);

    if (!response.ok) {
      let errorMessage: string = copy.lesson.saveError;

      try {
        const body = (await response.json()) as { error?: string };
        if (body.error) {
          errorMessage = body.error;
        }
      } catch {
        // Keep the localized fallback message.
      }

      setMessage(errorMessage);
      return;
    }

    const result = (await response.json()) as { level?: number };
    const updatedCompletedIds = [...new Set([...completedLessonIds, lesson.id])];
    finishMissionSuccess(result.level ?? 1, updatedCompletedIds);
  }

  function revealNextHint() {
    if (hintsUsed < lessonHints.length) {
      setHintsUsed((value) => value + 1);
      setMessage(null);
      return;
    }

    setMessage(copy.lesson.allHintsUnlocked);
  }

  function toggleSolution() {
    if (!showSolution && !canViewSolution) {
      setMessage(copy.lesson.solutionLocked);
      return;
    }

    setMessage(null);
    setShowSolution((value) => !value);
  }

  const previewNextLesson =
    nextLessonId ??
    resolveNextLesson(
      isAuthenticated
        ? [...new Set([...completedLessonIds, lesson.id])]
        : getStoredProgress().completedLessonIds
    );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-lg border border-ink/10 bg-white p-4 lg:col-span-2">
          <h2 className="text-xl font-black">{copy.lesson.missionInstructions}</h2>
          <p className="mt-2 text-sm font-semibold text-ink/60">{copy.lesson.missionTask}</p>
          <p className="mt-3 leading-7 text-ink/75">{lesson.mission}</p>
        </section>
        <section className="rounded-lg border border-ink/10 bg-white p-4 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-black uppercase tracking-wide text-ink/70" htmlFor="lesson-solution">
              {copy.lesson.yourSolution}
            </label>
            <span className="text-xs font-bold text-ink/45">
              {effortChars}/{MIN_EFFORT_CHARS}
            </span>
          </div>
          <textarea
            className="focus-ring mt-3 min-h-56 w-full rounded-md border border-ink/15 bg-ink px-4 py-3 font-mono text-sm leading-6 text-paper shadow-inner placeholder:text-paper/45 sm:min-h-64"
            id="lesson-solution"
            onChange={(event) => setSolutionInput(event.target.value)}
            placeholder={copy.lesson.solutionPlaceholder}
            value={solutionInput}
          />
        </section>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper/70 p-4">
        <div>
          <p className="text-sm font-black uppercase text-ink/60">{copy.lesson.missionCompletionArea}</p>
          <p className="mt-1 text-sm text-ink/60">{copy.lesson.missionCompletionHint}</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-3 text-center font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40 hover:bg-ink/5 hover:shadow-soft"
            onClick={revealNextHint}
            type="button"
          >
            <Lightbulb className="size-5" />
            {hintsUsed >= lessonHints.length
              ? copy.lesson.allHintsRevealed
              : formatMessage(copy.lesson.hintButton, { n: Math.min(hintsUsed + 1, 3) })}
          </button>
          <button
            className={`focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-center font-bold shadow-sm transition ${
              canViewSolution
                ? "border-ink/15 bg-white text-ink hover:-translate-y-0.5 hover:border-violet/40 hover:bg-ink/5 hover:shadow-soft"
                : "cursor-not-allowed border-ink/10 bg-ink/5 text-ink/45"
            }`}
            disabled={!showSolution && !canViewSolution}
            onClick={toggleSolution}
            type="button"
          >
            {!canViewSolution && !showSolution ? <Lock className="size-5" /> : <ScrollText className="size-5" />}
            {copy.lesson.showSolution}
          </button>
          <button
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-mint px-4 py-3 text-center font-black text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-mint/80 hover:shadow-soft disabled:translate-y-0 disabled:opacity-60"
            disabled={loading}
            onClick={completeMission}
            type="button"
          >
            <CheckCircle2 className="size-5" />
            {loading ? copy.login.working : copy.lesson.completeMission}
          </button>
        </div>
        {!canViewSolution && !showSolution ? (
          <p className="mt-3 text-xs font-bold text-ink/50">{copy.lesson.solutionLocked}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black uppercase text-ink/60">{copy.lesson.progressiveHints}</p>
          <p className="text-xs font-bold text-ink/45">
            {formatMessage(copy.lesson.hintsUsed, { used: hintsUsed, total: lessonHints.length })}
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {lessonHints.map((hint, index) => {
            const unlocked = index < hintsUsed;
            return (
              <div
                className={`rounded-md border p-4 text-sm leading-6 transition-all duration-300 ${
                  unlocked
                    ? "border-mint/30 bg-mint/15 text-ink/80"
                    : "border-ink/10 bg-ink/5 text-ink/40"
                }`}
                key={`${lesson.id}-hint-${index + 1}`}
              >
                <div className="flex items-start gap-2">
                  {unlocked ? (
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-violet" />
                  ) : (
                    <Lock className="mt-0.5 size-4 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-ink">
                      {formatMessage(copy.lesson.hintLabel, { n: index + 1 })}
                    </p>
                    <p className="mt-1">
                      {unlocked ? hint : formatMessage(copy.lesson.hintLocked, { n: index + 1 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          showSolution ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="mb-2 text-sm font-black uppercase text-ink/60">{copy.lesson.officialSolution}</p>
        <pre className="overflow-x-auto rounded-md bg-ink p-4 text-sm leading-6 text-paper">
          <code>{lesson.solution}</code>
        </pre>
      </div>

      {message ? (
        <div className="space-y-3 rounded-md bg-violet/15 p-4">
          <p className="text-sm font-bold text-ink">{message}</p>
          {nextLessonId ? (
            <p className="text-sm text-ink/70">{copy.lesson.redirectingNext}</p>
          ) : justCompleted ? (
            <p className="text-sm text-ink/70">{copy.lesson.allMissionsComplete}</p>
          ) : null}
          {previewNextLesson ? (
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper"
              onClick={() => router.push(`/lesson/${previewNextLesson}`)}
              type="button"
            >
              {copy.lesson.continueNextMission}
              <ArrowRight className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {showGuestModal ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-black">{copy.lesson.guestModalTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/75">{copy.lesson.guestModalBody}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90"
                onClick={() => router.push("/register")}
                type="button"
              >
                {copy.lesson.guestModalRegister}
              </button>
              <button
                className="focus-ring rounded-md border border-ink/15 px-4 py-3 text-sm font-bold text-ink transition hover:bg-ink/5"
                onClick={() => {
                  window.localStorage.setItem(guestContinueKey, "1");
                  setShowGuestModal(false);
                  router.push("/paths");
                }}
                type="button"
              >
                {copy.lesson.guestModalContinue}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
