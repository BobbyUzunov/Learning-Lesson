"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t, type Language } from "@/lib/i18n";

export function CloseAssessmentButton({ assessmentId, language }: { assessmentId: string; language: Language }) {
  const copy = t(language).assessment;
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function closeAssessment() {
    setPending(true);
    setError(false);
    try {
      const response = await fetch(`/api/teacher/assessments/${assessmentId}/close`, { method: "POST" });
      if (!response.ok) {
        setError(true);
        return;
      }
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className="inline-flex min-h-11 items-center rounded-lg border border-coral/30 px-4 py-2 text-sm font-bold text-coral hover:bg-coral/10 disabled:opacity-60"
        disabled={pending}
        onClick={closeAssessment}
        type="button"
      >
        {pending ? copy.closing : copy.closeButton}
      </button>
      {error ? <p className="mt-2 text-sm font-bold text-coral">{copy.closeError}</p> : null}
    </div>
  );
}
