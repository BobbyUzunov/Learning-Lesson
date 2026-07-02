"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GameLesson } from "@/lib/game-data";
import { t, type Language } from "@/lib/i18n";

type MissionEditorProps = {
  language: Language;
  lesson: GameLesson;
};

export function AdminMissionEditor({ language, lesson }: MissionEditorProps) {
  const copy = t(language);
  const router = useRouter();
  const [form, setForm] = useState({
    title: lesson.title,
    titleBg: lesson.titleBg ?? "",
    mission: lesson.mission,
    missionBg: lesson.missionBg ?? "",
    explanation: lesson.explanation,
    explanationBg: lesson.explanationBg ?? "",
    codeExample: lesson.codeExample,
    solution: lesson.solution,
    hint1: lesson.hint1 ?? lesson.hint ?? ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveMission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/admin/missions/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        titleBg: form.titleBg,
        mission: form.mission,
        missionBg: form.missionBg,
        explanation: form.explanation,
        explanationBg: form.explanationBg,
        codeExample: form.codeExample,
        solution: form.solution,
        hint1: form.hint1
      })
    });

    setLoading(false);
    setMessage(response.ok ? copy.admin.missionSaved : copy.admin.missionSaveError);
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <form className="mt-6 space-y-4 rounded-lg border border-ink/10 bg-white/80 p-5" onSubmit={saveMission}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          Title (EN)
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            value={form.title}
          />
        </label>
        <label className="block text-sm font-bold">
          Title (BG)
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => setForm((current) => ({ ...current, titleBg: event.target.value }))}
            value={form.titleBg}
          />
        </label>
      </div>
      <label className="block text-sm font-bold">
        Mission (EN)
        <textarea
          className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
          onChange={(event) => setForm((current) => ({ ...current, mission: event.target.value }))}
          value={form.mission}
        />
      </label>
      <label className="block text-sm font-bold">
        Mission (BG)
        <textarea
          className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
          onChange={(event) => setForm((current) => ({ ...current, missionBg: event.target.value }))}
          value={form.missionBg}
        />
      </label>
      <label className="block text-sm font-bold">
        Solution
        <textarea
          className="focus-ring mt-2 min-h-32 w-full rounded-md border border-ink/15 bg-ink px-3 py-2 font-mono text-sm text-paper"
          onChange={(event) => setForm((current) => ({ ...current, solution: event.target.value }))}
          value={form.solution}
        />
      </label>
      <button
        className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? copy.login.working : copy.admin.saveMission}
      </button>
      {message ? <p className="text-sm font-bold text-ink/70">{message}</p> : null}
    </form>
  );
}
