"use client";

import { useState } from "react";
import { CheckCircle2, Lightbulb, ScrollText } from "lucide-react";
import type { GameLesson } from "@/lib/game-data";
import { completeStoredLesson, getGameProgressStats } from "@/lib/game-progress";
import { t, type Language } from "@/lib/i18n";

export function MissionPanel({ language, lesson }: { language: Language; lesson: GameLesson }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const copy = t(language);

  async function completeMission() {
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
  }

  return (
    <section className="mt-8 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">{copy.lesson.missionTask}</h2>
      <p className="mt-3 leading-7 text-ink/75">{lesson.mission}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-3 text-center font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40 hover:bg-ink/5 hover:shadow-soft"
          onClick={() => setShowHint((value) => !value)}
          type="button"
        >
          <Lightbulb className="size-5" />
          {copy.lesson.showHint}
        </button>
        <button
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-3 text-center font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40 hover:bg-ink/5 hover:shadow-soft"
          onClick={() => setShowSolution((value) => !value)}
          type="button"
        >
          <ScrollText className="size-5" />
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
      {showHint ? <p className="mt-4 rounded-md bg-mint/15 p-4 text-sm leading-6 text-ink/75">{lesson.hint}</p> : null}
      {showSolution ? (
        <pre className="mt-4 overflow-x-auto rounded-md bg-ink p-4 text-sm leading-6 text-paper">
          <code>{lesson.solution}</code>
        </pre>
      ) : null}
      {message ? <p className="mt-4 rounded-md bg-violet/15 p-4 text-sm font-bold text-ink">{message}</p> : null}
    </section>
  );
}
