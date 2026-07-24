"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, KeyRound, RefreshCw, UserCog } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import type { ClassroomStatus } from "@/lib/classrooms/types";

type TransferCandidate = { id: string; label: string };

export function ClassroomControls({
  classroomId,
  language,
  status,
  joinCodeEnabled,
  canTransfer,
  transferCandidates
}: {
  classroomId: string;
  language: Language;
  status: ClassroomStatus;
  joinCodeEnabled: boolean;
  canTransfer: boolean;
  transferCandidates: TransferCandidate[];
}) {
  const copy = t(language);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newOwnerId, setNewOwnerId] = useState("");

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
    router.refresh();
  }

  const nextStatus = status === "active" ? "archived" : "active";

  return (
    <section className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
      <h2 className="text-lg font-black">{copy.teacher.manageTitle}</h2>
      <p className="mt-2 text-sm text-ink/70">{copy.teacher.manageSubtitle}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/15 px-4 py-2 text-sm font-bold transition hover:bg-ink/5 disabled:opacity-60"
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
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/15 px-4 py-2 text-sm font-bold transition hover:bg-ink/5 disabled:opacity-60"
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
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/15 px-4 py-2 text-sm font-bold transition hover:bg-ink/5 disabled:opacity-60"
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
        <div className="mt-5 border-t border-ink/10 pt-5">
          <label className="block text-sm font-bold text-ink/80" htmlFor="transfer-owner">
            {copy.teacher.transferLabel}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <select
              className="focus-ring w-full rounded-md border border-ink/15 bg-white px-3 py-3"
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
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
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

      {error ? <p className="mt-4 rounded-md bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">{error}</p> : null}
      {message ? <p className="mt-4 rounded-md bg-mint/15 px-4 py-3 text-sm font-semibold text-ink">{message}</p> : null}
    </section>
  );
}
