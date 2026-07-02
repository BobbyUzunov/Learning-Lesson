"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { arrayToLines, linesToArray } from "@/lib/cms/serialize";
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
    hint3Bg: lesson.hint3Bg ?? "",
    learningObjectives: arrayToLines(lesson.learningObjectives),
    learningObjectivesBg: arrayToLines(lesson.learningObjectivesBg),
    prerequisites: arrayToLines(lesson.prerequisites),
    prerequisitesBg: arrayToLines(lesson.prerequisitesBg),
    keyConcepts: arrayToLines(lesson.keyConcepts),
    keyConceptsBg: arrayToLines(lesson.keyConceptsBg),
    readingTimeMinutes: lesson.readingTimeMinutes?.toString() ?? ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveMission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSaved(false);

    const response = await fetch(`/api/admin/lessons/${lesson.id}`, {
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
        hint1: form.hint1,
        hint1Bg: form.hint1Bg,
        hint2: form.hint2,
        hint2Bg: form.hint2Bg,
        hint3: form.hint3,
        hint3Bg: form.hint3Bg,
        learningObjectives: linesToArray(form.learningObjectives),
        learningObjectivesBg: linesToArray(form.learningObjectivesBg),
        prerequisites: linesToArray(form.prerequisites),
        prerequisitesBg: linesToArray(form.prerequisitesBg),
        keyConcepts: linesToArray(form.keyConcepts),
        keyConceptsBg: linesToArray(form.keyConceptsBg),
        readingTimeMinutes: form.readingTimeMinutes ? Number(form.readingTimeMinutes) : null
      })
    });

    setLoading(false);
    setMessage(response.ok ? copy.admin.lessonSaved : copy.admin.lessonSaveError);
    if (response.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="mt-6 space-y-6 rounded-lg border border-ink/10 bg-white/80 p-5" onSubmit={saveMission}>
      <section className="space-y-4">
        <h2 className="text-lg font-black">{copy.admin.contentSection}</h2>
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
      </section>

      <section className="space-y-4 border-t border-ink/10 pt-6">
        <h2 className="text-lg font-black">{copy.admin.metadataSection}</h2>
        <p className="text-sm text-ink/65">{copy.admin.metadataHint}</p>
        <label className="block text-sm font-bold">
          {copy.admin.readingTime}
          <input
            className="focus-ring mt-2 w-full max-w-xs rounded-md border border-ink/15 px-3 py-2"
            min={1}
            onChange={(event) => updateField("readingTimeMinutes", event.target.value)}
            type="number"
            value={form.readingTimeMinutes}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-bold">
            {copy.admin.objectivesEn}
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => updateField("learningObjectives", event.target.value)}
              placeholder={copy.admin.linesHint}
              value={form.learningObjectives}
            />
          </label>
          <label className="block text-sm font-bold">
            {copy.admin.objectivesBg}
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => updateField("learningObjectivesBg", event.target.value)}
              placeholder={copy.admin.linesHint}
              value={form.learningObjectivesBg}
            />
          </label>
          <label className="block text-sm font-bold">
            {copy.admin.prerequisitesEn}
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => updateField("prerequisites", event.target.value)}
              placeholder={copy.admin.linesHint}
              value={form.prerequisites}
            />
          </label>
          <label className="block text-sm font-bold">
            {copy.admin.prerequisitesBg}
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => updateField("prerequisitesBg", event.target.value)}
              placeholder={copy.admin.linesHint}
              value={form.prerequisitesBg}
            />
          </label>
          <label className="block text-sm font-bold">
            {copy.admin.keyConceptsEn}
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => updateField("keyConcepts", event.target.value)}
              placeholder={copy.admin.linesHint}
              value={form.keyConcepts}
            />
          </label>
          <label className="block text-sm font-bold">
            {copy.admin.keyConceptsBg}
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => updateField("keyConceptsBg", event.target.value)}
              placeholder={copy.admin.linesHint}
              value={form.keyConceptsBg}
            />
          </label>
        </div>
      </section>

      <div>
        <button
          className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? copy.login.working : copy.admin.saveLesson}
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
        {message ? <p className="mt-3 text-sm font-bold text-ink/70">{message}</p> : null}
      </div>
    </form>
  );
}
