"use client";

import Link from "next/link";
import { useState } from "react";
import { Download } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

export function AccountDataSection({ language }: { language: Language }) {
  const copy = t(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportData() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account/export");
      if (!response.ok) {
        setError(copy.accountData.exportError);
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "learning-lesson-export.json";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(copy.accountData.exportError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-ink/10 bg-paper/70 p-4 sm:p-5">
      <h2 className="text-sm font-bold uppercase text-ink/60">{copy.accountData.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">{copy.accountData.subtitle}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-ink/5 disabled:opacity-60"
          disabled={loading}
          onClick={exportData}
          type="button"
        >
          <Download className="size-4" />
          {loading ? copy.accountData.exportWorking : copy.accountData.exportButton}
        </button>
        <Link
          className="text-sm font-semibold text-ink/65 underline-offset-4 hover:text-ink hover:underline"
          href="/privacy"
        >
          {copy.accountData.privacyLink}
        </Link>
      </div>
      {error ? (
        <p className="mt-4 rounded-md bg-coral/15 px-4 py-3 text-sm font-semibold text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
