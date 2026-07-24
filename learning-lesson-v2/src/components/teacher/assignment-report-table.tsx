"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssignmentReportRow, AssignmentStatus } from "@/lib/assignments/types";
import type { AssignmentReportSummary } from "@/lib/assignments/types";
import { shortStudentId } from "@/lib/classrooms/types";
import { t, type Language } from "@/lib/i18n";

type AssignmentReportTableProps = {
  language: Language;
  rows: AssignmentReportRow[];
  summary: AssignmentReportSummary;
};

function statusLabel(copy: ReturnType<typeof t>["teacher"], status: AssignmentStatus) {
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

function formatDate(value: string | null, language: Language) {
  if (!value) {
    return "—";
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
  const [error, setError] = useState<string | null>(null);

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
        setError(payload.error ?? copy.reviewError);
        return;
      }
      router.refresh();
    } catch {
      setError(copy.reviewError);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black sm:text-2xl">{copy.assignmentReportTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{copy.assignmentReportSubtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <p className="text-xs font-bold uppercase text-ink/50">{copy.summaryMissing}</p>
          <p className="mt-2 text-2xl font-black">{summary.missing}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <p className="text-xs font-bold uppercase text-ink/50">{copy.summarySubmitted}</p>
          <p className="mt-2 text-2xl font-black">{summary.submitted}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <p className="text-xs font-bold uppercase text-ink/50">{copy.summaryApproved}</p>
          <p className="mt-2 text-2xl font-black">{summary.approved}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/80 p-4">
          <p className="text-xs font-bold uppercase text-ink/50">{copy.summaryNeedsChanges}</p>
          <p className="mt-2 text-2xl font-black">{summary.needsChanges}</p>
        </div>
      </div>

      {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-6 text-sm text-ink/60">
          {copy.noStudents}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white/80">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-xs uppercase tracking-wide text-ink/55">
              <tr>
                <th className="px-4 py-3 font-bold">{copy.colStudent}</th>
                <th className="px-4 py-3 font-bold">{copy.colStatus}</th>
                <th className="px-4 py-3 font-bold">{copy.colDeliverable}</th>
                <th className="px-4 py-3 font-bold">{copy.colSubmitted}</th>
                <th className="px-4 py-3 font-bold">{copy.teacherNoteLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-b border-ink/5 align-top" key={row.studentId}>
                  <td className="px-4 py-3">
                    <p className="font-bold">{row.displayName || copy.colStudent}</p>
                    <p className="text-xs font-mono text-ink/50">{shortStudentId(row.studentId)}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{statusLabel(copy, row.status)}</td>
                  <td className="px-4 py-3">
                    {row.deliverableText ? (
                      <p className="max-w-xs whitespace-pre-wrap text-ink/80">{row.deliverableText}</p>
                    ) : null}
                    {row.deliverableUrl ? (
                      <a
                        className="mt-1 inline-flex text-sm font-bold text-violet hover:underline"
                        href={row.deliverableUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {copy.viewUrl}
                      </a>
                    ) : null}
                    {!row.deliverableText && !row.deliverableUrl ? (
                      <span className="text-ink/40">{copy.noDeliverable}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{formatDate(row.submittedAt, language)}</td>
                  <td className="px-4 py-3">
                    {row.submissionId &&
                    (row.status === "submitted" ||
                      row.status === "approved" ||
                      row.status === "needs_changes") ? (
                      <div className="space-y-2">
                        <textarea
                          className="min-h-16 w-full min-w-[14rem] rounded-md border border-ink/15 px-2 py-1.5 text-sm"
                          onChange={(event) =>
                            setNotes((current) => ({
                              ...current,
                              [row.submissionId!]: event.target.value
                            }))
                          }
                          placeholder={copy.teacherNotePlaceholder}
                          value={notes[row.submissionId] ?? row.teacherNote ?? ""}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-md bg-mint px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-60"
                            disabled={pendingId === row.submissionId}
                            onClick={() => review(row.submissionId!, "approve")}
                            type="button"
                          >
                            {pendingId === row.submissionId ? copy.reviewing : copy.approve}
                          </button>
                          <button
                            className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-bold disabled:opacity-60"
                            disabled={pendingId === row.submissionId}
                            onClick={() => review(row.submissionId!, "request_changes")}
                            type="button"
                          >
                            {copy.requestChanges}
                          </button>
                        </div>
                      </div>
                    ) : row.teacherNote ? (
                      <p className="max-w-xs text-sm text-ink/70">{row.teacherNote}</p>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
