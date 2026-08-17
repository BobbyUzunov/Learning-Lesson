"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { AssignmentReportRow, AssignmentReportSummary, AssignmentStatus } from "@/lib/assignments/types";
import {
  canShowApproveAction,
  canShowReturnAction,
  getAssignmentReviewMode,
  sortAssignmentReportRows
} from "@/lib/assignments/review-ui";
import { t, type Language } from "@/lib/i18n";

type AssignmentReportTableProps = {
  language: Language;
  rows: AssignmentReportRow[];
  summary: AssignmentReportSummary;
};

type TeacherCopy = ReturnType<typeof t>["teacher"];

function statusLabel(copy: TeacherCopy, status: AssignmentStatus) {
  switch (status) {
    case "submitted":
      return copy.statusSubmitted;
    case "approved":
      return copy.statusApproved;
    case "needs_changes":
      return copy.statusNeedsChanges;
    case "draft":
      return copy.statusDraft;
    default:
      return copy.statusMissing;
  }
}

function statusClass(status: AssignmentStatus) {
  switch (status) {
    case "submitted":
      return "bg-violet/15 text-violet";
    case "approved":
      return "bg-mint/20 text-ink";
    case "needs_changes":
      return "bg-coral/15 text-coral";
    default:
      return "bg-ink/[0.06] text-ink/50";
  }
}

function formatDate(value: string | null, language: Language) {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function AssignmentReportTable({ language, rows, summary }: AssignmentReportTableProps) {
  const copy = t(language).teacher;
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sorted = sortAssignmentReportRows(rows);

  async function review(submissionId: string, action: "approve" | "request_changes") {
    setPendingId(submissionId);
    setError(null);

    try {
      const response = await fetch(`/api/teacher/submissions/${submissionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          teacherNote: notes[submissionId] ?? ""
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error === "teacher_note_required" ? copy.noteRequired : (payload.error ?? copy.reviewError));
        return;
      }
      setReturningId(null);
      router.refresh();
    } catch {
      setError(copy.reviewError);
    } finally {
      setPendingId(null);
    }
  }

  if (rows.length === 0) {
    return <p className="text-sm text-ink/55">{copy.assignmentReportEmpty}</p>;
  }

  return (
    <div className="space-y-4">
      {summary.submitted > 0 ? (
        <p className="text-sm font-semibold text-violet">
          {copy.waitingReview.replace("{count}", String(summary.submitted))}
        </p>
      ) : (
        <p className="text-sm text-ink/50">{copy.allCaughtUp}</p>
      )}

      {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}

      <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-white/80">
        {sorted.map((row, index) => {
          const mode = getAssignmentReviewMode(row.status);
          const busy = pendingId === row.submissionId;
          const isReturning = Boolean(row.submissionId && returningId === row.submissionId);
          const submittedAt = formatDate(row.submittedAt, language);
          const noteValue = row.submissionId ? (notes[row.submissionId] ?? row.teacherNote ?? "") : "";
          const showApprove = Boolean(row.submissionId && canShowApproveAction(row.status) && !isReturning);
          const showReturnStart = Boolean(row.submissionId && canShowReturnAction(row.status) && !isReturning);

          return (
            <li className={index > 0 ? "border-t border-ink/8" : undefined} key={row.studentId}>
              <div className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold tracking-tight">
                      {row.displayName || copy.colStudent}
                    </p>
                    <p className="mt-1 text-sm text-ink/50">
                      {submittedAt ? `${copy.colSubmitted}: ${submittedAt}` : copy.statusMissing}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(row.status)}`}>
                    {statusLabel(copy, row.status)}
                  </span>
                </div>

                {row.deliverableText ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">{row.deliverableText}</p>
                ) : null}
                {row.deliverableUrl ? (
                  <a
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-violet hover:underline"
                    href={row.deliverableUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {copy.viewUrl}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
                {!row.deliverableText && !row.deliverableUrl && mode !== "none" ? (
                  <p className="mt-3 text-sm text-ink/40">{copy.noDeliverable}</p>
                ) : null}

                {mode === "returned" && row.teacherNote ? (
                  <p className="mt-3 text-sm leading-6 text-ink/65">{row.teacherNote}</p>
                ) : null}

                {row.submissionId && (showApprove || showReturnStart || isReturning) ? (
                  <div className="mt-4 space-y-3">
                    {isReturning ? (
                      <>
                        <textarea
                          className="min-h-20 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm leading-6"
                          onChange={(event) =>
                            setNotes((current) => ({
                              ...current,
                              [row.submissionId!]: event.target.value
                            }))
                          }
                          placeholder={copy.teacherNoteReturnPlaceholder}
                          value={noteValue}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-coral/30 bg-coral/10 px-4 py-2 text-sm font-bold disabled:opacity-60"
                            disabled={busy}
                            onClick={() => review(row.submissionId!, "request_changes")}
                            type="button"
                          >
                            {busy ? copy.reviewing : copy.requestChanges}
                          </button>
                          <button
                            className="focus-ring inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-bold text-ink/50 hover:text-ink"
                            disabled={busy}
                            onClick={() => setReturningId(null)}
                            type="button"
                          >
                            {copy.cancelChange}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {showApprove ? (
                          <button
                            className="focus-ring inline-flex min-h-11 items-center rounded-xl bg-mint px-4 py-2 text-sm font-bold text-ink disabled:opacity-60"
                            disabled={busy}
                            onClick={() => review(row.submissionId!, "approve")}
                            type="button"
                          >
                            {busy ? copy.reviewing : mode === "returned" ? copy.approveNow : copy.approve}
                          </button>
                        ) : null}
                        {showReturnStart ? (
                          <button
                            className={
                              mode === "approved"
                                ? "text-sm font-bold text-ink/40 underline-offset-4 hover:text-ink hover:underline"
                                : "focus-ring inline-flex min-h-11 items-center rounded-xl border border-ink/15 px-4 py-2 text-sm font-bold"
                            }
                            disabled={busy}
                            onClick={() => setReturningId(row.submissionId)}
                            type="button"
                          >
                            {copy.requestChanges}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
