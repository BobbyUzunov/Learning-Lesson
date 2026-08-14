"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, KeyRound, RefreshCw, UserMinus, UserPlus, UserCog } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import type { ClassroomStatus, ClassroomTeacher } from "@/lib/classrooms/types";

type TransferCandidate = { id: string; label: string };

export function ClassroomControls({
  classroomId,
  language,
  status,
  joinCodeEnabled,
  canTransfer,
  transferCandidates,
  classroomTeachers,
  coTeacherCandidates
}: {
  classroomId: string;
  language: Language;
  status: ClassroomStatus;
  joinCodeEnabled: boolean;
  canTransfer: boolean;
  transferCandidates: TransferCandidate[];
  classroomTeachers: ClassroomTeacher[];
  coTeacherCandidates: TransferCandidate[];
}) {
  const copy = t(language);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newOwnerId, setNewOwnerId] = useState("");
  const [coTeacherId, setCoTeacherId] = useState("");

  async function callApi(key: string, url: string, body?: Record<string, unknown>, successMessage?: string) {
    setLoading(key);
    setError(null);
    setMessage(null);

    const response = await fetch(url, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });

    setLoading(null);

    if (!response.ok) {
      setError(copy.teacher.manageError);
      return;
    }

    if (successMessage) {
      setMessage(successMessage);
    }
    if (key === "add-co-teacher") {
      setCoTeacherId("");
    }
    router.refresh();
  }

  const nextStatus = status === "active" ? "archived" : "active";

  return (
    <div className="p-3 sm:p-4">
      <div className="flex flex-wrap gap-2">
        <button
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-ink/12 px-3.5 py-2 text-sm font-bold transition hover:bg-ink/5 disabled:opacity-60"
          disabled={loading !== null}
          onClick={() =>
            void callApi(
              "status",
              `/api/teacher/classrooms/${classroomId}/status`,
              { status: nextStatus },
              nextStatus === "archived" ? copy.teacher.archivedSuccess : copy.teacher.restoredSuccess
            )
          }
          type="button"
        >
          <Archive className="size-4" />
          {loading === "status"
            ? copy.teacher.saving
            : status === "active"
              ? copy.teacher.archiveButton
              : copy.teacher.restoreButton}
        </button>

        <button
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-ink/12 px-3.5 py-2 text-sm font-bold transition hover:bg-ink/5 disabled:opacity-60"
          disabled={loading !== null}
          onClick={() =>
            void callApi(
              "rotate",
              `/api/teacher/classrooms/${classroomId}/join-code/rotate`,
              undefined,
              copy.teacher.rotatedSuccess
            )
          }
          type="button"
        >
          <RefreshCw className="size-4" />
          {loading === "rotate" ? copy.teacher.saving : copy.teacher.rotateCodeButton}
        </button>

        <button
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-ink/12 px-3.5 py-2 text-sm font-bold transition hover:bg-ink/5 disabled:opacity-60"
          disabled={loading !== null || (status === "archived" && !joinCodeEnabled)}
          onClick={() =>
            void callApi(
              "enabled",
              `/api/teacher/classrooms/${classroomId}/join-code/enabled`,
              { enabled: !joinCodeEnabled },
              joinCodeEnabled ? copy.teacher.codeDisabledSuccess : copy.teacher.codeEnabledSuccess
            )
          }
          type="button"
        >
          <KeyRound className="size-4" />
          {loading === "enabled"
            ? copy.teacher.saving
            : joinCodeEnabled
              ? copy.teacher.disableCodeButton
              : copy.teacher.enableCodeButton}
        </button>
      </div>

      {canTransfer ? (
        <div className="mt-4 border-t border-ink/8 pt-4">
          <p className="text-sm font-bold text-ink/70">{copy.teacher.coTeachersLabel}</p>
          {classroomTeachers.length === 0 ? (
            <p className="mt-2 text-sm text-ink/50">{copy.teacher.coTeachersEmpty}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {classroomTeachers.map((teacher) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/8 bg-white px-3 py-2"
                  key={teacher.userId}
                >
                  <span>
                    <span className="block text-sm font-bold">{teacher.label}</span>
                    <span className="text-xs font-semibold text-ink/50">
                      {teacher.role === "owner" ? copy.teacher.ownerRole : copy.teacher.coTeacherRole}
                    </span>
                  </span>
                  {teacher.role === "co_teacher" ? (
                    <button
                      className="focus-ring inline-flex items-center gap-2 rounded-xl border border-ink/12 px-3 py-1.5 text-sm font-bold transition hover:bg-ink/5 disabled:opacity-60"
                      disabled={loading !== null}
                      onClick={() =>
                        void callApi(
                          `remove-${teacher.userId}`,
                          `/api/teacher/classrooms/${classroomId}/teachers/${teacher.userId}/remove`,
                          undefined,
                          copy.teacher.removeCoTeacherSuccess
                        )
                      }
                      type="button"
                    >
                      <UserMinus className="size-4" />
                      {loading === `remove-${teacher.userId}`
                        ? copy.teacher.saving
                        : copy.teacher.removeCoTeacherButton}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {coTeacherCandidates.length > 0 ? (
            <div className="mt-4">
              <label className="block text-sm font-bold text-ink/70" htmlFor="add-co-teacher">
                {copy.teacher.addCoTeacherLabel}
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <select
                  className="focus-ring w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5"
                  id="add-co-teacher"
                  onChange={(event) => setCoTeacherId(event.target.value)}
                  value={coTeacherId}
                >
                  <option value="">{copy.teacher.addCoTeacherPlaceholder}</option>
                  {coTeacherCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.label}
                    </option>
                  ))}
                </select>
                <button
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
                  disabled={loading !== null || !coTeacherId}
                  onClick={() =>
                    void callApi(
                      "add-co-teacher",
                      `/api/teacher/classrooms/${classroomId}/teachers`,
                      { userId: coTeacherId },
                      copy.teacher.addCoTeacherSuccess
                    )
                  }
                  type="button"
                >
                  <UserPlus className="size-4" />
                  {loading === "add-co-teacher" ? copy.teacher.saving : copy.teacher.addCoTeacherButton}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {canTransfer && transferCandidates.length > 0 ? (
        <div className="mt-4 border-t border-ink/8 pt-4">
          <label className="block text-sm font-bold text-ink/70" htmlFor="transfer-owner">
            {copy.teacher.transferLabel}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <select
              className="focus-ring w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5"
              id="transfer-owner"
              onChange={(event) => setNewOwnerId(event.target.value)}
              value={newOwnerId}
            >
              <option value="">{copy.teacher.transferPlaceholder}</option>
              {transferCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label}
                </option>
              ))}
            </select>
            <button
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
              disabled={loading !== null || !newOwnerId}
              onClick={() =>
                void callApi(
                  "transfer",
                  `/api/teacher/classrooms/${classroomId}/transfer`,
                  { newOwnerId },
                  copy.teacher.transferSuccess
                )
              }
              type="button"
            >
              <UserCog className="size-4" />
              {loading === "transfer" ? copy.teacher.saving : copy.teacher.transferButton}
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 rounded-xl bg-coral/15 px-3 py-2 text-sm font-semibold text-ink">{error}</p> : null}
      {message ? <p className="mt-3 rounded-xl bg-mint/15 px-3 py-2 text-sm font-semibold text-ink">{message}</p> : null}
    </div>
  );
}
