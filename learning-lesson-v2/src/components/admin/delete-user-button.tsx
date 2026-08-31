"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMessage, t, type Language } from "@/lib/i18n";

export function DeleteUserButton({
  language,
  userId,
  userEmail,
  userName,
  role,
  currentAdminId
}: {
  language: Language;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  role: string;
  currentAdminId: string | null;
}) {
  const copy = t(language);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role === "admin" || userId === currentAdminId) {
    return null;
  }

  async function deleteUser() {
    const label = userName?.trim() || userEmail?.trim() || copy.common.learner;
    const confirmed = window.confirm(formatMessage(copy.admin.deleteUserConfirm, { name: label }));
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      const code = payload?.error ?? "user_delete_failed";

      if (code === "teacher_has_classrooms") {
        setError(copy.admin.deleteUserHasClassrooms);
        return;
      }

      if (code === "cannot_delete_self") {
        setError(copy.admin.deleteUserSelf);
        return;
      }

      setError(copy.admin.deleteUserError);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        className="focus-ring inline-flex items-center justify-center rounded-md border border-coral/35 px-3 py-2 text-sm font-bold text-coral transition hover:bg-coral/10 disabled:opacity-60"
        disabled={loading}
        onClick={deleteUser}
        type="button"
      >
        {loading ? copy.admin.deleteUserWorking : copy.admin.deleteUser}
      </button>
      {error ? <span className="text-xs font-semibold text-coral">{error}</span> : null}
    </div>
  );
}
