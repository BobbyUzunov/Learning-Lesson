"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lightbulb, ScrollText } from "lucide-react";
import type { GameLesson } from "@/lib/game-data";
import { completeStoredLesson, getGameProgressStats, guestContinueKey } from "@/lib/game-progress";
import { t, type Language } from "@/lib/i18n";

export function MissionPanel({
  isAuthenticated,
  language,
  lesson
}: {
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
  const router = useRouter();
  const copy = t(language);
  const lessonHints = [lesson.hint1, lesson.hint2, lesson.hint3, lesson.hint]
    .filter((hint): hint is string => Boolean(hint?.trim()))
    .slice(0, 3);
  const typedSomething = solutionInput.trim().length > 0;
  const canViewSolution = hintsUsed >= 2 || typedSomething;

  async function completeMission() {
    if (!typedSomething && hintsUsed < lessonHints.length) {
      setMessage("Напиши решение или използвай подсказките преди да завършиш мисията.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id })
    });

    setLoading(false);

    if (response.ok) {
      const result = (await response.json()) as { level?: number };
      setMessage(`${copy.lesson.completeMessage} ${result.level ?? 1}.`);
      return;
    }

    const progress = completeStoredLesson(lesson.id);
    const stats = getGameProgressStats(progress);
    setMessage(`${copy.lesson.completeMessage} ${stats.level}.`);
    if (!isAuthenticated && lesson.id === "1") {
      setShowGuestModal(true);
    }
  }

  function revealNextHint() {
    if (hintsUsed < lessonHints.length) {
      setHintsUsed((value) => value + 1);
      setMessage(null);
      return;
    }

    setMessage("Всички подсказки вече са отключени.");
  }

  function toggleSolution() {
    if (!showSolution && !canViewSolution) {
      setMessage("Опитай първо сам или използвай подсказка.");
      return;
    }

    setMessage(null);
    setShowSolution((value) => !value);
  }

  return (
    <section className="mt-8 space-y-5 rounded-lg border border-ink/10 bg-white/85 p-4 shadow-sm sm:p-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-lg border border-ink/10 bg-white p-4 lg:col-span-2">
          <h2 className="text-xl font-black">Mission & Instructions</h2>
          <p className="mt-2 text-sm font-semibold text-ink/60">{copy.lesson.missionTask}</p>
          <p className="mt-3 leading-7 text-ink/75">{lesson.mission}</p>
        </section>
        <section className="rounded-lg border border-ink/10 bg-white p-4 lg:col-span-3">
          <label className="text-sm font-black uppercase tracking-wide text-ink/70" htmlFor="lesson-solution">
            Твоето решение
          </label>
          <textarea
            className="focus-ring mt-3 min-h-56 w-full rounded-md border border-ink/15 bg-ink px-4 py-3 font-mono text-sm leading-6 text-paper shadow-inner placeholder:text-paper/45 sm:min-h-64"
            id="lesson-solution"
            onChange={(event) => setSolutionInput(event.target.value)}
            placeholder="Напиши своя код тук..."
            value={solutionInput}
          />
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-3 text-center font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40 hover:bg-ink/5 hover:shadow-soft"
          onClick={revealNextHint}
          type="button"
        >
          <Lightbulb className="size-5" />
          {hintsUsed >= lessonHints.length ? "Всички подсказки" : `Подсказка ${Math.min(hintsUsed + 1, 3)}`}
        </button>
        <div className="relative">
          <button
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-3 text-center font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40 hover:bg-ink/5 hover:shadow-soft disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!showSolution && !canViewSolution}
            onClick={toggleSolution}
            type="button"
          >
            <ScrollText className="size-5" />
            {copy.lesson.showSolution}
          </button>
          {!showSolution && !canViewSolution ? (
            <button
              aria-label="solution-locked-overlay"
              className="absolute inset-0"
              onClick={() => setMessage("Опитай първо сам или използвай подсказка.")}
              type="button"
            />
          ) : null}
        </div>
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

      <div className="text-sm font-bold text-ink/70">Подсказки използвани: {hintsUsed} / 3</div>
      <div className="space-y-3">
        {lessonHints.slice(0, hintsUsed).map((hint, index) => (
          <p
            className="rounded-md border border-mint/30 bg-mint/15 p-4 text-sm leading-6 text-ink/80 opacity-100 transition-all duration-300 ease-out"
            key={`${lesson.id}-hint-${index + 1}`}
          >
            <span className="mr-2 font-bold text-ink">Hint {index + 1}:</span>
            {hint}
          </p>
        ))}
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          showSolution ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <pre className="overflow-x-auto rounded-md bg-ink p-4 text-sm leading-6 text-paper">
          <code>{lesson.solution}</code>
        </pre>
      </div>
      {message ? <p className="rounded-md bg-violet/15 p-4 text-sm font-bold text-ink">{message}</p> : null}
      {showGuestModal ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-black">Браво! Завърши първата мисия 🎉</h3>
            <p className="mt-3 text-sm leading-6 text-ink/75">
              Създай безплатен акаунт, за да запазиш прогреса си, XP и отключените мисии.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90"
                onClick={() => router.push("/register")}
                type="button"
              >
                Създай акаунт
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
                Продължи като гост
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
