"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

export function AdminSeedButton({ language }: { language: Language }) {
  const copy = t(language);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runSeed() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/admin/seed-catalog", { method: "POST" });
    setLoading(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setMessage(body.error ?? copy.admin.seedError);
      return;
    }

    const result = (await response.json()) as {
      courses?: number;
      lessons?: number;
      metadata?: number;
      quizQuestions?: number;
      lessonQuizTopics?: number;
      projects?: number;
      specialties?: number;
      curriculumModules?: number;
      curriculumMissions?: number;
    };

    setMessage(
      copy.admin.seedSuccess
        .replace("{courses}", String(result.courses ?? 0))
        .replace("{lessons}", String(result.lessons ?? 0))
        .replace("{quiz}", String(result.quizQuestions ?? 0))
        .replace("{projects}", String(result.projects ?? 0))
    );
    router.refresh();
  }

  return (
    <section className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-5">
      <h2 className="text-xl font-black">{copy.admin.seedTitle}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{copy.admin.seedSubtitle}</p>
      <button
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading}
        onClick={runSeed}
        type="button"
      >
        <Database className="size-4" />
        {loading ? copy.admin.seedWorking : copy.admin.seedButton}
      </button>
      {message ? <p className="mt-4 rounded-md bg-mint/15 px-4 py-3 text-sm font-semibold text-ink">{message}</p> : null}
    </section>
  );
}
