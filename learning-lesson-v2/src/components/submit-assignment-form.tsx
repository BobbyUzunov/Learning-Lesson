"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssignmentStatus } from "@/lib/assignments/types";
import { t, type Language } from "@/lib/i18n";

type SubmitAssignmentFormProps = {
  assignmentId: string;
  initialText?: string | null;
  initialUrl?: string | null;
  language: Language;
  status: AssignmentStatus;
  teacherNote?: string | null;
};

export function SubmitAssignmentForm({
  assignmentId,
  initialText,
  initialUrl,
  language,
  status,
  teacherNote
}: SubmitAssignmentFormProps) {
  const copy = t(language).classroom;
  const router = useRouter();
  const [text, setText] = useState(initialText ?? "");
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit = status === "missing" || status === "draft" || status === "needs_changes";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverableText: text, deliverableUrl: url })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? copy.submitError);
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError(copy.submitError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" onSubmit={onSubmit}>
      <h2 className="text-xl font-black">{copy.submitTitle}</h2>
      <p className="mt-1 text-sm text-ink/60">{copy.submitSubtitle}</p>

      {teacherNote && status === "needs_changes" ? (
        <div className="mt-4 rounded-md border border-coral/30 bg-coral/10 px-4 py-3">
          <p className="text-xs font-bold uppercase text-coral">{copy.teacherNoteTitle}</p>
          <p className="mt-2 text-sm leading-6 text-ink/80">{teacherNote}</p>
          <p className="mt-2 text-xs font-semibold text-ink/55">{copy.resubmitHint}</p>
        </div>
      ) : null}

      <label className="mt-4 block text-sm font-bold">
        {copy.deliverableTextLabel}
        <textarea
          className="mt-1 min-h-32 w-full rounded-md border border-ink/15 bg-white px-3 py-2 disabled:opacity-70"
          disabled={!canSubmit || pending}
          maxLength={10000}
          onChange={(event) => setText(event.target.value)}
          placeholder={copy.deliverableTextPlaceholder}
          value={text}
        />
      </label>

      <label className="mt-3 block text-sm font-bold">
        {copy.deliverableUrlLabel}
        <input
          className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 disabled:opacity-70"
          disabled={!canSubmit || pending}
          maxLength={2000}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={copy.deliverableUrlPlaceholder}
          type="url"
          value={url}
        />
      </label>

      {error ? <p className="mt-3 text-sm font-semibold text-coral">{error}</p> : null}
      {success ? <p className="mt-3 text-sm font-semibold text-mint">{copy.submitSuccess}</p> : null}

      {canSubmit ? (
        <button
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 py-2 font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
          disabled={pending || (!text.trim() && !url.trim())}
          type="submit"
        >
          {pending ? copy.submitting : copy.submitButton}
        </button>
      ) : (
        <p className="mt-4 text-sm font-semibold text-ink/55">
          {status === "submitted"
            ? copy.statusSubmitted
            : status === "approved"
              ? copy.statusApproved
              : copy.statusDraft}
        </p>
      )}
    </form>
  );
}
