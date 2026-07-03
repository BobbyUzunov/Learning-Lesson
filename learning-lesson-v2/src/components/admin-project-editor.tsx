"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseProject } from "@/lib/projects/types";
import { parseChecklistJson } from "@/lib/cms/serialize";
import { t, type Language } from "@/lib/i18n";

export function AdminProjectEditor({ language, project }: { language: Language; project: CourseProject }) {
  const copy = t(language);
  const router = useRouter();
  const [form, setForm] = useState({
    afterLessonId: project.afterLessonId,
    type: project.type,
    title: project.title,
    titleBg: project.titleBg ?? "",
    description: project.description,
    descriptionBg: project.descriptionBg ?? "",
    briefLabel: project.briefLabel,
    briefLabelBg: project.briefLabelBg ?? "",
    briefPlaceholder: project.briefPlaceholder,
    briefPlaceholderBg: project.briefPlaceholderBg ?? "",
    briefMinLength: String(project.briefMinLength),
    requiresRepo: project.requiresRepo,
    requiresDeploy: project.requiresDeploy,
    requiredForCertificate: project.requiredForCertificate,
    checklist: JSON.stringify(project.checklist, null, 2)
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    let checklist;
    try {
      checklist = parseChecklistJson(form.checklist);
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : copy.admin.projectSaveError);
      return;
    }

    const response = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        afterLessonId: form.afterLessonId,
        type: form.type,
        title: form.title,
        titleBg: form.titleBg,
        description: form.description,
        descriptionBg: form.descriptionBg,
        briefLabel: form.briefLabel,
        briefLabelBg: form.briefLabelBg,
        briefPlaceholder: form.briefPlaceholder,
        briefPlaceholderBg: form.briefPlaceholderBg,
        briefMinLength: Number(form.briefMinLength),
        requiresRepo: form.requiresRepo,
        requiresDeploy: form.requiresDeploy,
        requiredForCertificate: form.requiredForCertificate,
        checklist
      })
    });

    setLoading(false);
    setMessage(response.ok ? copy.admin.projectSaved : copy.admin.projectSaveError);
    if (response.ok) {
      router.refresh();
    }
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="mt-6 space-y-4 rounded-lg border border-ink/10 bg-white/80 p-5" onSubmit={saveProject}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.projectAfterLesson}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("afterLessonId", event.target.value)}
            value={form.afterLessonId}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.projectType}
          <select
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("type", event.target.value as CourseProject["type"])}
            value={form.type}
          >
            <option value="mini">mini</option>
            <option value="capstone">capstone</option>
          </select>
        </label>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.descriptionEn}
          <textarea
            className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("description", event.target.value)}
            value={form.description}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.descriptionBg}
          <textarea
            className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("descriptionBg", event.target.value)}
            value={form.descriptionBg}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.projectBriefLabelEn}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("briefLabel", event.target.value)}
            value={form.briefLabel}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.projectBriefLabelBg}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("briefLabelBg", event.target.value)}
            value={form.briefLabelBg}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.projectBriefPlaceholderEn}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("briefPlaceholder", event.target.value)}
            value={form.briefPlaceholder}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.projectBriefPlaceholderBg}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("briefPlaceholderBg", event.target.value)}
            value={form.briefPlaceholderBg}
          />
        </label>
      </div>

      <label className="block text-sm font-bold">
        {copy.admin.projectMinLength}
        <input
          className="focus-ring mt-2 w-full max-w-xs rounded-md border border-ink/15 px-3 py-2"
          min={1}
          onChange={(event) => updateField("briefMinLength", event.target.value)}
          type="number"
          value={form.briefMinLength}
        />
      </label>

      <div className="flex flex-wrap gap-4 text-sm font-bold">
        <label className="inline-flex items-center gap-2">
          <input checked={form.requiresRepo} onChange={(event) => updateField("requiresRepo", event.target.checked)} type="checkbox" />
          {copy.admin.projectRequiresRepo}
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            checked={form.requiresDeploy}
            onChange={(event) => updateField("requiresDeploy", event.target.checked)}
            type="checkbox"
          />
          {copy.admin.projectRequiresDeploy}
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            checked={form.requiredForCertificate}
            onChange={(event) => updateField("requiredForCertificate", event.target.checked)}
            type="checkbox"
          />
          {copy.admin.projectRequiredForCertificate}
        </label>
      </div>

      <label className="block text-sm font-bold">
        {copy.admin.projectChecklist}
        <textarea
          className="focus-ring mt-2 min-h-40 w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-xs"
          onChange={(event) => updateField("checklist", event.target.value)}
          value={form.checklist}
        />
      </label>

      {message ? <p className="rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">{message}</p> : null}

      <button
        className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? copy.admin.seedWorking : copy.admin.saveProject}
      </button>
    </form>
  );
}
