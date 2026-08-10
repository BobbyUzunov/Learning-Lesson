"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, CheckCircle2, Lightbulb, Lock, ScrollText } from "lucide-react";
import { useRouter } from "next/navigation";
import { LessonKeyConcepts } from "@/components/lesson-key-concepts";
import { KnowledgeCheck } from "@/components/knowledge-check";
import { getGlobalNextLessonFromCourses } from "@/lib/catalog/helpers";
import { lessonDraftKey, type LessonMissionDraft } from "@/lib/draft-storage";
import type { GameLesson, GameQuest } from "@/lib/game-data";
import { getGameProgressStats } from "@/lib/game-progress";
import { canCompleteLessonMission } from "@/lib/lesson-completion";
import { completeStoredLesson, guestContinueKey } from "@/lib/game-progress-storage";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { formatMessage, t, type Language } from "@/lib/i18n";
import type { LocalizedLessonStructure } from "@/lib/lesson-structure";
import type { KnowledgeCheckAttempt, KnowledgeCheckContent } from "@/lib/knowledge-check/types";

const MIN_EFFORT_CHARS = 12;

const LessonAiHint = dynamic(() =>
  import("@/components/lesson-ai-hint").then((module) => module.LessonAiHint)
);

type LessonStage = 1 | 2 | 3;

const unavailableKnowledgeCheckContent: KnowledgeCheckContent = {
  questions: [],
  lessonTopics: {},
  source: "unavailable"
};

export function LessonStages({
  completedLessonIds,
  courses,
  isAuthenticated,
  language,
  lesson,
  knowledgeCheckContent,
  structure,
  courseTitle
}: {
  completedLessonIds: string[];
  courses: GameQuest[];
  isAuthenticated: boolean;
  language: Language;
  lesson: GameLesson;
  knowledgeCheckContent: KnowledgeCheckContent;
  structure: LocalizedLessonStructure;
  courseTitle: string;
}) {
  const copy = t(language);
  const router = useRouter();
  const [stage, setStage] = useState<LessonStage>(1);
  const [knowledgeCheckAttempt, setKnowledgeCheckAttempt] = useState<KnowledgeCheckAttempt | null>(null);
  const [knowledgeCheckVersion, setKnowledgeCheckVersion] = useState(0);
  const [knowledgeCheckRejectedAsUnavailable, setKnowledgeCheckRejectedAsUnavailable] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const lessonCompleted = completedLessonIds.includes(lesson.id);
  const {
    value: missionDraft,
    setValue: setMissionDraft,
    status: draftStatus,
    clearDraft
  } = useDraftAutosave<LessonMissionDraft>({
    key: lessonDraftKey(lesson.id),
    initialValue: { solution: "", hintsUsed: 0 },
    enabled: !lessonCompleted
  });

  const solutionInput = missionDraft.solution;
  const hintsUsed = missionDraft.hintsUsed;
  const lessonHints = [lesson.hint1, lesson.hint2, lesson.hint3].filter((hint): hint is string => Boolean(hint?.trim()));
  const effortChars = solutionInput.trim().length;
  const hasEffort = effortChars >= MIN_EFFORT_CHARS;
  const allHintsUsed = hintsUsed >= lessonHints.length;
  const canViewSolution = hasEffort || allHintsUsed;
  const primaryObjective = structure.learningObjectives[0] ?? lesson.title;

  function resolveNextLesson(updatedCompletedIds: string[]) {
    return getGlobalNextLessonFromCourses(courses, updatedCompletedIds);
  }

  function finishMissionSuccess(level: number, updatedCompletedIds: string[], options?: { showGuestModal?: boolean }) {
    clearDraft();
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

  function changeStage(nextStage: LessonStage) {
    if (nextStage === stage) {
      return;
    }

    setKnowledgeCheckAttempt(null);
    setKnowledgeCheckVersion((value) => value + 1);
    setKnowledgeCheckRejectedAsUnavailable(false);
    setMessage(null);
    setNextLessonId(null);
    setJustCompleted(false);
    setStage(nextStage);
  }

  function handleKnowledgeCheckResult(attempt: KnowledgeCheckAttempt | null) {
    setKnowledgeCheckAttempt(attempt);
    if (!justCompleted) {
      setMessage(null);
      setNextLessonId(null);
    }
  }

  async function completeMission() {
    const gate = canCompleteLessonMission({
      effortChars,
      minEffortChars: MIN_EFFORT_CHARS,
      hintsUsed,
      hintCount: lessonHints.length,
      knowledgeCheckPassed: Boolean(knowledgeCheckAttempt?.passed)
    });

    if (!gate.ok) {
      if (gate.reason === "effort") {
        setMessage(copy.lesson.completeBeforeFinish);
      } else {
        setMessage(copy.lesson.knowledgeCheckRequired);
        setStage(3);
      }
      return;
    }

    const knowledgeCheckAnswers = knowledgeCheckAttempt?.answers;
    if (!knowledgeCheckAnswers) {
      setMessage(copy.lesson.knowledgeCheckRequired);
      setStage(3);
      return;
    }

    setLoading(true);
    setMessage(null);
    setNextLessonId(null);
    setJustCompleted(false);

    if (!isAuthenticated) {
      let guestResponse: Response;
      try {
        guestResponse = await fetch("/api/progress/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            knowledgeCheckAnswers
          })
        });
      } catch {
        setLoading(false);
        setMessage(copy.lesson.saveError);
        return;
      }

      if (!guestResponse.ok) {
        let errorMessage: string = copy.lesson.saveError;
        let knowledgeCheckRejected = false;
        let knowledgeCheckUnavailable = false;
        try {
          const body = (await guestResponse.json()) as { error?: string };
          if (body.error === "knowledge_check_not_passed" || body.error === "quiz_not_passed") {
            errorMessage = copy.lesson.knowledgeCheckVerificationFailed;
            knowledgeCheckRejected = true;
          } else if (
            body.error === "knowledge_check_unavailable" ||
            body.error === "quiz_unavailable"
          ) {
            errorMessage = copy.knowledgeCheck.unavailable;
            knowledgeCheckRejected = true;
            knowledgeCheckUnavailable = true;
          }
        } catch {
          // Keep fallback.
        }

        if (knowledgeCheckRejected) {
          setKnowledgeCheckAttempt(null);
          setKnowledgeCheckVersion((value) => value + 1);
          setKnowledgeCheckRejectedAsUnavailable(knowledgeCheckUnavailable);
          router.refresh();
        }

        setLoading(false);
        setMessage(errorMessage);
        return;
      }

      const progress = completeStoredLesson(lesson.id);
      const stats = getGameProgressStats(progress);
      finishMissionSuccess(stats.level, progress.completedLessonIds, {
        showGuestModal: true
      });
      setLoading(false);
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          knowledgeCheckAnswers
        })
      });
    } catch {
      setLoading(false);
      setMessage(copy.lesson.saveError);
      return;
    }

    setLoading(false);

    if (!response.ok) {
      let errorMessage: string = copy.lesson.saveError;
      let knowledgeCheckRejected = false;
      let knowledgeCheckUnavailable = false;
      try {
        const body = (await response.json()) as { error?: string };
        if (body.error === "knowledge_check_not_passed" || body.error === "quiz_not_passed") {
          errorMessage = copy.lesson.knowledgeCheckVerificationFailed;
          knowledgeCheckRejected = true;
        } else if (body.error === "knowledge_check_unavailable" || body.error === "quiz_unavailable") {
          errorMessage = copy.knowledgeCheck.unavailable;
          knowledgeCheckRejected = true;
          knowledgeCheckUnavailable = true;
        } else if (body.error === "lesson_locked") {
          errorMessage = copy.paths.lessonLockMessage;
        }
      } catch {
        // Keep fallback.
      }
      if (knowledgeCheckRejected) {
        setKnowledgeCheckAttempt(null);
        setKnowledgeCheckVersion((value) => value + 1);
        setKnowledgeCheckRejectedAsUnavailable(knowledgeCheckUnavailable);
        router.refresh();
      }
      setMessage(errorMessage);
      return;
    }

    const result = (await response.json().catch(() => ({}))) as { level?: number };
    const updatedCompletedIds = [...new Set([...completedLessonIds, lesson.id])];
    finishMissionSuccess(result.level ?? 1, updatedCompletedIds);
  }

  function revealNextHint() {
    if (hintsUsed < lessonHints.length) {
      setMissionDraft((current) => ({ ...current, hintsUsed: current.hintsUsed + 1 }));
      setMessage(null);
      if (hintsUsed + 1 >= 1) {
        setShowAi(true);
      }
      return;
    }
    setMessage(copy.lesson.allHintsUnlocked);
  }

  function checkAttempt() {
    if (!hasEffort && hintsUsed === 0) {
      setMessage(copy.lesson.completeBeforeFinish);
      return;
    }
    setKnowledgeCheckAttempt(null);
    setKnowledgeCheckVersion((value) => value + 1);
    setKnowledgeCheckRejectedAsUnavailable(false);
    setMessage(null);
    setNextLessonId(null);
    setJustCompleted(false);
    setShowAi(true);
    setStage(3);
  }

  return (
    <article className="mt-6 space-y-6">
      <header className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">{courseTitle}</p>
        <h1 className="mt-3 break-words font-display text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
        <nav aria-label={copy.lesson.stagesLabel} className="mt-5 flex gap-2">
          {([1, 2, 3] as const).map((value) => {
            const isAvailable = value <= stage + 1;

            return (
              <button
                aria-current={stage === value ? "step" : undefined}
                className={`focus-ring rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  stage === value ? "bg-ink text-paper" : "bg-ink/5 text-ink/50"
                } disabled:cursor-not-allowed disabled:opacity-45`}
                disabled={!isAvailable}
                key={value}
                onClick={() => changeStage(value)}
                type="button"
              >
                {value}. {value === 1 ? copy.lesson.stageLearn : value === 2 ? copy.lesson.stageDo : copy.lesson.stageCheck}
              </button>
            );
          })}
        </nav>
      </header>

      {stage === 1 ? (
        <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet">{copy.lesson.stageLearn}</p>
          <h2 className="mt-3 text-xl font-bold">{copy.syllabus.objectives}</h2>
          <p className="mt-2 text-base leading-7 text-ink/75">{primaryObjective}</p>

          <h2 className="mt-8 text-xl font-bold">{copy.syllabus.sectionTheory}</h2>
          <p className="mt-3 leading-8 text-ink/80">{lesson.explanation}</p>

          <h2 className="mt-8 text-xl font-bold">{copy.syllabus.sectionExample}</h2>
          <div className="mt-3 rounded-xl border border-ink/10 bg-ink p-4 text-paper">
            <pre className="overflow-x-auto rounded-md bg-black/20 p-4 text-sm leading-6">
              <code>{lesson.codeExample}</code>
            </pre>
          </div>

          <button
            className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-ink px-5 py-3 font-bold text-paper"
            onClick={() => setStage(2)}
            type="button"
          >
            {copy.lesson.goToTask}
            <ArrowRight className="size-5" />
          </button>
        </section>
      ) : null}

      {stage === 2 ? (
        <section className="space-y-5 rounded-2xl border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet">{copy.lesson.stageDo}</p>
          <h2 className="mt-2 text-xl font-bold">{copy.syllabus.sectionTask}</h2>
          <p className="mt-3 leading-7 text-ink/75">{lesson.mission}</p>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-ink/70" htmlFor="lesson-solution">
                {copy.lesson.yourSolution}
              </label>
              <span className="text-xs font-bold text-ink/45">
                {effortChars}/{MIN_EFFORT_CHARS}
              </span>
            </div>
            {draftStatus === "restored" || draftStatus === "saved" ? (
              <p className="mt-2 text-xs font-semibold text-ink/50">
                {draftStatus === "restored" ? copy.lesson.draftRestored : copy.lesson.draftSaved}
              </p>
            ) : null}
            <textarea
              className="focus-ring mt-3 min-h-40 w-full rounded-xl border border-ink/15 bg-ink px-4 py-3 font-mono text-sm leading-6 text-paper"
              id="lesson-solution"
              onChange={(event) => setMissionDraft((current) => ({ ...current, solution: event.target.value }))}
              placeholder={copy.lesson.solutionPlaceholder}
              value={solutionInput}
            />
          </div>

          {hintsUsed === 0 ? (
            <button
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-bold"
              onClick={revealNextHint}
              type="button"
            >
              <Lightbulb className="size-4" />
              {copy.lesson.showOneHint}
            </button>
          ) : null}

          {hintsUsed > 0 ? (
            <div className="space-y-3 rounded-xl border border-mint/30 bg-mint/10 p-4">
              {lessonHints.slice(0, hintsUsed).map((hint, index) => (
                <div key={`${lesson.id}-hint-${index + 1}`}>
                  <p className="text-xs font-bold uppercase text-ink/50">
                    {formatMessage(copy.lesson.hintLabel, { n: index + 1 })}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/80">{hint}</p>
                </div>
              ))}
              {hintsUsed < lessonHints.length ? (
                <button
                  className="text-sm font-bold text-violet underline-offset-4 hover:underline"
                  onClick={revealNextHint}
                  type="button"
                >
                  {formatMessage(copy.lesson.hintButton, { n: hintsUsed + 1 })}
                </button>
              ) : null}
            </div>
          ) : null}

          {showAi ? (
            <LessonAiHint effort={solutionInput} isAuthenticated={isAuthenticated} language={language} lessonId={lesson.id} />
          ) : null}

          {canViewSolution ? (
            <button
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-bold"
              onClick={() => setShowSolution((value) => !value)}
              type="button"
            >
              {showSolution ? <ScrollText className="size-4" /> : <Lock className="size-4" />}
              {copy.lesson.showSolution}
            </button>
          ) : null}

          {showSolution ? (
            <pre className="max-h-[40vh] overflow-auto rounded-xl bg-ink p-4 text-sm leading-6 text-paper">
              <code>{lesson.solution}</code>
            </pre>
          ) : null}

          {message && stage === 2 ? <p className="text-sm font-semibold text-coral">{message}</p> : null}

          <button
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink"
            onClick={checkAttempt}
            type="button"
          >
            <CheckCircle2 className="size-5" />
            {copy.lesson.checkAttempt}
          </button>
        </section>
      ) : null}

      {stage === 3 ? (
        <section className="space-y-6 rounded-2xl border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet">{copy.lesson.stageCheck}</p>

          <KnowledgeCheck
            content={
              knowledgeCheckRejectedAsUnavailable
                ? unavailableKnowledgeCheckContent
                : knowledgeCheckContent
            }
            key={`${lesson.id}:${knowledgeCheckVersion}`}
            language={language}
            lessonId={lesson.id}
            onResult={handleKnowledgeCheckResult}
          />

          {knowledgeCheckAttempt?.passed ? (
            <LessonKeyConcepts language={language} structure={structure} />
          ) : null}

          <button
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink disabled:opacity-60 sm:w-auto"
            disabled={loading || !knowledgeCheckAttempt?.passed}
            id="complete-mission-button"
            onClick={completeMission}
            type="button"
          >
            <CheckCircle2 className="size-5" />
            {loading ? copy.login.working : copy.lesson.completeMission}
          </button>

          {message ? (
            <div className="space-y-3 rounded-xl bg-violet/15 p-4">
              <p className="text-sm font-bold text-ink">{message}</p>
              {nextLessonId ? <p className="text-sm text-ink/70">{copy.lesson.redirectingNext}</p> : null}
              {justCompleted && !nextLessonId ? (
                <p className="text-sm text-ink/70">{copy.lesson.allMissionsComplete}</p>
              ) : null}
              {justCompleted && nextLessonId ? (
                <button
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-paper"
                  onClick={() => router.push(`/lesson/${nextLessonId}`)}
                  type="button"
                >
                  {copy.lesson.continueNextMission}
                  <ArrowRight className="size-4" />
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {showGuestModal ? (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-ink/50 p-4">
          <div className="my-auto w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-soft sm:p-6">
            <h3 className="text-2xl font-bold">{copy.lesson.guestModalTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/75">{copy.lesson.guestModalBody}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="focus-ring rounded-xl bg-ink px-4 py-3 text-sm font-bold text-paper"
                onClick={() => router.push("/register")}
                type="button"
              >
                {copy.lesson.guestModalRegister}
              </button>
              <button
                className="focus-ring rounded-xl border border-ink/15 px-4 py-3 text-sm font-bold"
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
    </article>
  );
}
