"use client";

import Link from "next/link";
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
    hint1: lesson.hint1 ?? lesson.hint ?? "",
    hint1Bg: lesson.hint1Bg ?? lesson.hintBg ?? "",
    hint2: lesson.hint2 ?? "",
    hint2Bg: lesson.hint2Bg ?? "",
    hint3: lesson.hint3 ?? "",
    hint3Bg: lesson.hint3Bg ?? ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveMission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSaved(false);

    const response = await fetch(`/api/admin/missions/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setLoading(false);
    setMessage(response.ok ? copy.admin.missionSaved : copy.admin.missionSaveError);
    if (response.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="mt-6 space-y-4 rounded-lg border border-ink/10 bg-white/80 p-5" onSubmit={saveMission}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.titleEn}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("title", event.target.value)}
            value={form.title}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.titleBg}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("titleBg", event.target.value)}
            value={form.titleBg}
          />
        </label>
      </div>
      <label className="block text-sm font-bold">
        {copy.admin.missionEn}
        <textarea
          className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
          onChange={(event) => updateField("mission", event.target.value)}
          value={form.mission}
        />
      </label>
      <label className="block text-sm font-bold">
        {copy.admin.missionBg}
        <textarea
          className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
          onChange={(event) => updateField("missionBg", event.target.value)}
          value={form.missionBg}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.explanationEn}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("explanation", event.target.value)}
            value={form.explanation}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.explanationBg}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("explanationBg", event.target.value)}
            value={form.explanationBg}
          />
        </label>
      </div>
      <label className="block text-sm font-bold">
        {copy.admin.codeExampleLabel}
        <textarea
          className="focus-ring mt-2 min-h-32 w-full rounded-md border border-ink/15 bg-ink px-3 py-2 font-mono text-sm text-paper"
          onChange={(event) => updateField("codeExample", event.target.value)}
          value={form.codeExample}
        />
      </label>
      <label className="block text-sm font-bold">
        {copy.admin.solutionLabel}
        <textarea
          className="focus-ring mt-2 min-h-32 w-full rounded-md border border-ink/15 bg-ink px-3 py-2 font-mono text-sm text-paper"
          onChange={(event) => updateField("solution", event.target.value)}
          value={form.solution}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.hint1En}
          <textarea
            className="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("hint1", event.target.value)}
            value={form.hint1}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.hint1Bg}
          <textarea
            className="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("hint1Bg", event.target.value)}
            value={form.hint1Bg}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.hint2En}
          <textarea
            className="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("hint2", event.target.value)}
            value={form.hint2}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.hint2Bg}
          <textarea
            className="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("hint2Bg", event.target.value)}
            value={form.hint2Bg}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.hint3En}
          <textarea
            className="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("hint3", event.target.value)}
            value={form.hint3}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.hint3Bg}
          <textarea
            className="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("hint3Bg", event.target.value)}
            value={form.hint3Bg}
          />
        </label>
      </div>
      <button
        className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? copy.login.working : copy.admin.saveMission}
      </button>
      {saved ? (
        <Link
          className="focus-ring ml-3 inline-block rounded-md border border-ink/15 px-4 py-3 text-sm font-bold"
          href={`/lesson/${lesson.id}`}
          target="_blank"
        >
          {copy.admin.viewMission}
        </Link>
      ) : null}
      {message ? <p className="text-sm font-bold text-ink/70">{message}</p> : null}
    </form>
  );
}
