"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import { shortStudentId, type ClassroomReportRow } from "@/lib/classrooms/types";

export function ClassroomStudentsList({
  classroomId,
  language,
  rows
}: {
  classroomId: string;
  language: Language;
  rows: ClassroomReportRow[];
}) {
  const copy = t(language);
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(row: ClassroomReportRow) {
    setEditingId(row.studentId);
    setDraftName(row.rosterName?.trim() || row.displayName?.trim() || "");
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName("");
    setError(null);
  }

  async function saveName(studentId: string) {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/teacher/classrooms/${classroomId}/members/${studentId}/name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rosterName: draftName })
    });

    setLoading(false);

    if (!response.ok) {
      setError(copy.teacher.renameStudentError);
      return;
    }

    setEditingId(null);
    setDraftName("");
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="mt-3 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-5 text-sm text-ink/55">
        {copy.teacher.noStudents}
      </p>
    );
  }

  return (
    <div className="mt-3">
      {error ? <p className="mb-2 text-sm font-semibold text-coral">{error}</p> : null}
      <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
        {rows.map((row, index) => {
          const isEditing = editingId === row.studentId;
          const label = row.displayName?.trim() || shortStudentId(row.studentId);

          return (
            <li
              className={`flex items-center justify-between gap-3 px-4 py-3 ${
                index > 0 ? "border-t border-ink/8" : ""
              }`}
              key={row.studentId}
            >
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      aria-label={copy.teacher.renameStudentLabel}
                      autoFocus
                      className="focus-ring min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold text-ink"
                      disabled={loading}
                      maxLength={80}
                      onChange={(event) => setDraftName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void saveName(row.studentId);
                        }
                        if (event.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      placeholder={copy.teacher.renameStudentPlaceholder}
                      value={draftName}
                    />
                    <button
                      className="focus-ring inline-flex size-8 items-center justify-center rounded-lg bg-mint text-ink disabled:opacity-60"
                      disabled={loading}
                      onClick={() => void saveName(row.studentId)}
                      title={copy.teacher.renameStudentSave}
                      type="button"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      className="focus-ring inline-flex size-8 items-center justify-center rounded-lg border border-ink/12 text-ink/60 disabled:opacity-60"
                      disabled={loading}
                      onClick={cancelEdit}
                      title={copy.teacher.renameStudentCancel}
                      type="button"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="truncate font-semibold text-ink/85">{label}</p>
                    {row.email ? (
                      <p className="truncate text-xs text-ink/40">{row.email}</p>
                    ) : null}
                  </>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!isEditing ? (
                  <button
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-ink/45 transition hover:bg-ink/5 hover:text-ink/70"
                    onClick={() => startEdit(row)}
                    type="button"
                  >
                    <Pencil className="size-3.5" />
                    {copy.teacher.renameStudent}
                  </button>
                ) : null}
                <span className="text-xs font-bold text-ink/40">
                  {row.completedLessons} {copy.teacher.colCompleted.toLowerCase()}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
