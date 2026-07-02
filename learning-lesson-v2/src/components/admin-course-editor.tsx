"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GameQuest } from "@/lib/game-data";
import { t, type Language } from "@/lib/i18n";

type AdminCourseEditorProps = {
  course: GameQuest;
  language: Language;
};

export function AdminCourseEditor({ course, language }: AdminCourseEditorProps) {
  const copy = t(language);
  const router = useRouter();
  const [form, setForm] = useState({
    title: course.title,
    titleBg: course.titleBg ?? "",
    description: course.description,
    descriptionBg: course.descriptionBg ?? "",
    difficulty: course.difficulty,
    difficultyBg: course.difficultyBg ?? "",
    estimatedTime: course.estimatedTime,
    estimatedTimeBg: course.estimatedTimeBg ?? "",
    rewardBadge: course.rewardBadge,
    rewardBadgeBg: course.rewardBadgeBg ?? "",
    xpReward: course.xpReward
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSaved(false);

    const response = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setLoading(false);
    setMessage(response.ok ? copy.admin.courseSaved : copy.admin.courseSaveError);
    if (response.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="mt-6 space-y-4 rounded-lg border border-ink/10 bg-white/80 p-5" onSubmit={saveCourse}>
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
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("description", event.target.value)}
            value={form.description}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.descriptionBg}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("descriptionBg", event.target.value)}
            value={form.descriptionBg}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.difficultyEn}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("difficulty", event.target.value)}
            value={form.difficulty}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.difficultyBg}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("difficultyBg", event.target.value)}
            value={form.difficultyBg}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.estimatedTimeEn}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("estimatedTime", event.target.value)}
            value={form.estimatedTime}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.estimatedTimeBg}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("estimatedTimeBg", event.target.value)}
            value={form.estimatedTimeBg}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.rewardBadgeEn}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("rewardBadge", event.target.value)}
            value={form.rewardBadge}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.rewardBadgeBg}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("rewardBadgeBg", event.target.value)}
            value={form.rewardBadgeBg}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.xpRewardLabel}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-2"
            min={0}
            onChange={(event) => updateField("xpReward", Number(event.target.value) || 0)}
            type="number"
            value={form.xpReward}
          />
        </label>
        <div className="rounded-md border border-ink/10 bg-ink/[0.03] px-3 py-2 text-sm text-ink/70">
          <p className="font-bold text-ink">{copy.admin.courseStats}</p>
          <p className="mt-2">
            {course.lessonIds.length} {copy.admin.lessons}
          </p>
        </div>
      </div>

      <button
        className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? copy.login.working : copy.admin.saveCourse}
      </button>
      {saved ? (
        <Link
          className="focus-ring ml-3 inline-block rounded-md border border-ink/15 px-4 py-3 text-sm font-bold"
          href="/paths"
          target="_blank"
        >
          {copy.admin.viewCourse}
        </Link>
      ) : null}
      {message ? <p className="text-sm font-bold text-ink/70">{message}</p> : null}
    </form>
  );
}
