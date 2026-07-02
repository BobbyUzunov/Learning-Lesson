"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquareWarning } from "lucide-react";
import type { AdminProjectSubmissionRecord } from "@/lib/projects/types";
import type { CourseProject } from "@/lib/projects/types";
import { t, type Language } from "@/lib/i18n";

export function AdminSubmissionReviewForm({
  language,
  project,
  submission
}: {
  language: Language;
  project: CourseProject;
  submission: AdminProjectSubmissionRecord;
}) {
  const copy = t(language);
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState(submission.review_notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"approve" | "request_changes" | null>(null);

  async function handleReview(action: "approve" | "request_changes") {
    setLoading(action);
    setMessage(null);

    const response = await fetch(`/api/admin/submissions/${submission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNotes })
    });

    setLoading(null);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      if (body.error === "review_notes_required") {
        setMessage(copy.admin.reviewNotesRequired);
        return;
      }
      setMessage(copy.admin.reviewError);
      return;
    }

    setMessage(action === "approve" ? copy.admin.reviewApproved : copy.admin.reviewChangesRequested);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-lg border border-ink/10 bg-white/85 p-5">
        <h2 className="text-xl font-black">{project.title}</h2>
        <p className="mt-2 text-sm text-ink/70">{project.description}</p>
        <dl className="mt-4 grid gap-3 text-sm">
          <div>
            <dt className="font-bold text-ink/55">{copy.admin.reviewLearner}</dt>
            <dd className="mt-1 font-semibold text-ink">
              {submission.learner_name ?? submission.learner_email ?? submission.user_id}
            </dd>
          </div>
          {submission.repo_url ? (
            <div>
              <dt className="font-bold text-ink/55">{copy.projects.repoUrl}</dt>
              <dd className="mt-1 break-all">
                <a className="font-semibold text-violet hover:underline" href={submission.repo_url} rel="noreferrer" target="_blank">
                  {submission.repo_url}
                </a>
              </dd>
            </div>
          ) : null}
          {submission.deploy_url ? (
            <div>
              <dt className="font-bold text-ink/55">{copy.projects.deployUrl}</dt>
              <dd className="mt-1 break-all">
                <a className="font-semibold text-violet hover:underline" href={submission.deploy_url} rel="noreferrer" target="_blank">
                  {submission.deploy_url}
                </a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-bold text-ink/55">{project.briefLabel}</dt>
            <dd className="mt-1 whitespace-pre-wrap leading-6 text-ink/80">{submission.notes}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white/85 p-5">
        <label className="text-sm font-black uppercase tracking-wide text-ink/70" htmlFor="review-notes">
          {copy.admin.reviewNotesLabel}
        </label>
        <textarea
          className="focus-ring mt-3 min-h-32 w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm leading-6"
          id="review-notes"
          onChange={(event) => setReviewNotes(event.target.value)}
          placeholder={copy.admin.reviewNotesPlaceholder}
          value={reviewNotes}
        />
      </section>

      {message ? (
        <p className="rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">{message}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-mint px-5 py-4 font-black text-ink transition hover:bg-mint/90 disabled:opacity-60"
          disabled={loading !== null}
          onClick={() => handleReview("approve")}
          type="button"
        >
          <CheckCircle2 className="size-5" />
          {loading === "approve" ? copy.admin.reviewWorking : copy.admin.reviewApprove}
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-coral px-5 py-4 font-black text-paper transition hover:bg-coral/90 disabled:opacity-60"
          disabled={loading !== null}
          onClick={() => handleReview("request_changes")}
          type="button"
        >
          <MessageSquareWarning className="size-5" />
          {loading === "request_changes" ? copy.admin.reviewWorking : copy.admin.reviewRequestChanges}
        </button>
      </div>
    </div>
  );
}
