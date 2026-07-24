"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

export function JoinClassroomCard({ language }: { language: Language }) {
  const copy = t(language);
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/classrooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode: code })
    });

    setLoading(false);

    if (!response.ok) {
      setError(copy.classroom.joinError);
      return;
    }

    setCode("");
    setSuccess(copy.classroom.joinSuccess);
    router.refresh();
  }

  return (
    <form className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" onSubmit={submit}>
      <h2 className="text-xl font-black">{copy.classroom.joinTitle}</h2>
      <p className="mt-2 text-sm text-ink/70">{copy.classroom.joinSubtitle}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          aria-label={copy.classroom.joinTitle}
          className="focus-ring w-full rounded-md border border-ink/15 bg-white px-3 py-3 font-mono text-lg uppercase tracking-[0.3em]"
          maxLength={6}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder={copy.classroom.joinPlaceholder}
          value={code}
        />
        <button
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
          disabled={loading || code.length !== 6}
          type="submit"
        >
          <LogIn className="size-4" />
          {loading ? copy.classroom.joining : copy.classroom.joinButton}
        </button>
      </div>

      {error ? <p className="mt-4 rounded-md bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">{error}</p> : null}
      {success ? (
        <p className="mt-4 rounded-md bg-mint/15 px-4 py-3 text-sm font-semibold text-ink">{success}</p>
      ) : null}
    </form>
  );
}
