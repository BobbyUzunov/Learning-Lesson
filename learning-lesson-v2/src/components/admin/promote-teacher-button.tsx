"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t, type Language } from "@/lib/i18n";

export function PromoteTeacherButton({
  language,
  userId,
  role
}: {
  language: Language;
  userId: string;
  role: string;
}) {
  const copy = t(language);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role === "admin") {
    return <span className="text-xs font-bold uppercase text-ink/40">{copy.admin.roleAdmin}</span>;
  }

  const nextRole = role === "teacher" ? "user" : "teacher";
  const label = role === "teacher" ? copy.admin.makeStudent : copy.admin.makeTeacher;

  async function toggleRole() {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole })
    });

    setLoading(false);

    if (!response.ok) {
      setError(copy.admin.roleError);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        className="focus-ring inline-flex items-center justify-center rounded-md border border-ink/15 px-3 py-2 text-sm font-bold text-ink transition hover:bg-ink/5 disabled:opacity-60"
        disabled={loading}
        onClick={toggleRole}
        type="button"
      >
        {label}
      </button>
      {error ? <span className="text-xs font-semibold text-coral">{error}</span> : null}
    </div>
  );
}
