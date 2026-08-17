"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Clock3, ExternalLink } from "lucide-react";
import type { AssignmentReportRow, AssignmentReportSummary, AssignmentStatus } from "@/lib/assignments/types";
import { getAssignmentReviewMode, sortAssignmentReportRows } from "@/lib/assignments/review-ui";
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
      return "bg-ink/[0.06] text-ink/55";
  }
}

function cardClass(status: AssignmentStatus) {
  switch (status) {
    case "submitted":
      return "border-violet/25 bg-white/90 ring-1 ring-violet/10";
    case "approved":
      return "border-mint/20 bg-mint/[0.08]";
    case "needs_changes":
      return "border-coral/20 bg-coral/[0.06]";
    default:
      return "border-ink/10 bg-white/70";
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
  const pendingRows = sorted.filter((row) => getAssignmentReviewMode(row.status) === "pending");
  const otherRows = sorted.filter((row) => getAssignmentReviewMode(row.status) !== "pending");

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

  const stats = [
    { label: copy.summarySubmitted, value: summary.submitted, tone: "pending" as const },
    { label: copy.summaryApproved, value: summary.approved, tone: "ok" as const },
    { label: copy.summaryNeedsChanges, value: summary.needsChanges, tone: "warn" as const },
    { label: copy.summaryMissing, value: summary.missing, tone: "mute" as const }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{copy.assignmentReportTitle}</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink/60">{copy.assignmentReportSubtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            className={`rounded-2xl border p-4 ${
              stat.tone === "pending" && stat.value > 0
                ? "border-violet/25 bg-violet/10"
                : stat.tone === "ok" && stat.value > 0
                  ? "border-mint/25 bg-mint/10"
                  : stat.tone === "warn" && stat.value > 0
                    ? "border-coral/25 bg-coral/10"
                    : "border-ink/10 bg-white/80"
            }`}
            key={stat.label}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/45">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm font-semibold text-ink">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-5 text-sm text-ink/55">
          {copy.assignmentReportEmpty}
        </p>
      ) : (
        <div className="space-y-8">
          {pendingRows.length > 0 ? (
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold tracking-tight">{copy.reviewNowTitle}</h3>
              {pendingRows.map((row) => (
                <StudentReviewCard
                  busy={pendingId === row.submissionId}
                  copy={copy}
                  isReturning={false}
                  key={row.studentId}
                  language={language}
                  notes={notes}
                  onNoteChange={(submissionId, value) =>
                    setNotes((current) => ({ ...current, [submissionId]: value }))
                  }
                  onReturnToggle={() => undefined}
                  onReview={review}
                  row={row}
                />
              ))}
            </section>
          ) : null}

          {otherRows.length > 0 ? (
            <section className="space-y-3">
              {pendingRows.length > 0 ? (
                <h3 className="font-display text-lg font-bold tracking-tight">{copy.otherStudentsTitle}</h3>
              ) : null}
              {otherRows.map((row) => (
                <StudentReviewCard
                  busy={pendingId === row.submissionId}
                  copy={copy}
                  isReturning={returningId === row.submissionId}
                  key={row.studentId}
                  language={language}
                  notes={notes}
                  onNoteChange={(submissionId, value) =>
                    setNotes((current) => ({ ...current, [submissionId]: value }))
                  }
                  onReturnToggle={(submissionId) =>
                    setReturningId((current) => (current === submissionId ? null : submissionId))
                  }
                  onReview={review}
                  row={row}
                />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function StudentReviewCard({
  busy,
  copy,
  isReturning,
  language,
  notes,
  onNoteChange,
  onReturnToggle,
  onReview,
  row
}: {
  busy: boolean;
  copy: TeacherCopy;
  isReturning: boolean;
  language: Language;
  notes: Record<string, string>;
  onNoteChange: (submissionId: string, value: string) => void;
  onReturnToggle: (submissionId: string) => void;
  onReview: (submissionId: string, action: "approve" | "request_changes") => void;
  row: AssignmentReportRow;
}) {
  const mode = getAssignmentReviewMode(row.status);
  const submittedAt = formatDate(row.submittedAt, language);
  const noteValue = row.submissionId ? (notes[row.submissionId] ?? row.teacherNote ?? "") : "";

  return (
    <article className={`rounded-2xl border p-4 sm:p-5 ${cardClass(row.status)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold tracking-tight">{row.displayName || copy.colStudent}</p>
          {submittedAt ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink/50">
              <Clock3 className="size-3.5" />
              {copy.colSubmitted}: {submittedAt}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink/45">{copy.statusMissing}</p>
          )}
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(row.status)}`}>
          {statusLabel(copy, row.status)}
        </span>
      </div>

      {row.deliverableText || row.deliverableUrl ? (
        <div className="mt-4 rounded-xl bg-white/70 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">{copy.colDeliverable}</p>
          {row.deliverableText ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/80">{row.deliverableText}</p>
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
        </div>
      ) : mode !== "none" ? (
        <p className="mt-4 text-sm text-ink/40">{copy.noDeliverable}</p>
      ) : null}

      {row.submissionId && mode === "pending" ? (
        <div className="mt-4 space-y-3">
          <textarea
            className="min-h-20 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-6"
            onChange={(event) => onNoteChange(row.submissionId!, event.target.value)}
            placeholder={copy.teacherNotePlaceholder}
            value={noteValue}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="focus-ring inline-flex min-h-11 items-center rounded-xl bg-mint px-4 py-2 text-sm font-bold text-ink disabled:opacity-60"
              disabled={busy}
              onClick={() => onReview(row.submissionId!, "approve")}
              type="button"
            >
              {busy ? copy.reviewing : copy.approve}
            </button>
            <button
              className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-bold disabled:opacity-60"
              disabled={busy}
              onClick={() => onReview(row.submissionId!, "request_changes")}
              type="button"
            >
              {copy.requestChanges}
            </button>
          </div>
        </div>
      ) : null}

      {row.submissionId && mode === "approved" ? (
        <div className="mt-4 space-y-3">
          <p className="inline-flex items-start gap-2 text-sm font-semibold text-ink">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
            {copy.reviewComplete}
          </p>
          {row.teacherNote ? <p className="text-sm leading-6 text-ink/70">{row.teacherNote}</p> : null}
          {isReturning ? (
            <div className="space-y-3">
              <textarea
                className="min-h-20 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-6"
                onChange={(event) => onNoteChange(row.submissionId!, event.target.value)}
                placeholder={copy.teacherNoteReturnPlaceholder}
                value={noteValue}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-coral/30 bg-coral/10 px-4 py-2 text-sm font-bold text-ink disabled:opacity-60"
                  disabled={busy}
                  onClick={() => onReview(row.submissionId!, "request_changes")}
                  type="button"
                >
                  {busy ? copy.reviewing : copy.requestChanges}
                </button>
                <button
                  className="focus-ring inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-bold text-ink/55 hover:text-ink"
                  disabled={busy}
                  onClick={() => onReturnToggle(row.submissionId!)}
                  type="button"
                >
                  {copy.cancelChange}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="text-sm font-bold text-ink/45 underline-offset-4 hover:text-ink hover:underline"
              onClick={() => onReturnToggle(row.submissionId!)}
              type="button"
            >
              {copy.changeApproved}
            </button>
          )}
        </div>
      ) : null}

      {row.submissionId && mode === "returned" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-ink">{copy.reviewReturned}</p>
          {row.teacherNote ? (
            <p className="rounded-xl bg-white/70 px-3 py-2.5 text-sm leading-6 text-ink/75">{row.teacherNote}</p>
          ) : null}
          <button
            className="focus-ring inline-flex min-h-11 items-center rounded-xl bg-mint px-4 py-2 text-sm font-bold text-ink disabled:opacity-60"
            disabled={busy}
            onClick={() => onReview(row.submissionId!, "approve")}
            type="button"
          >
            {busy ? copy.reviewing : copy.approveNow}
          </button>
        </div>
      ) : null}
    </article>
  );
}
