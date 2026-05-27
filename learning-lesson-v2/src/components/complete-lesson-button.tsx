"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type CompleteLessonButtonProps = {
  lessonId: string;
  disabled?: boolean;
  labels: {
    complete: string;
    saved: string;
    needsLogin: string;
    working: string;
  };
};

export function CompleteLessonButton({ lessonId, disabled, labels }: CompleteLessonButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function completeLesson() {
    setStatus("saving");
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId })
    });

    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <button
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-mint px-4 py-3 font-bold text-ink transition hover:bg-mint/80 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/50"
      disabled={disabled || status === "saving" || status === "saved"}
      onClick={completeLesson}
      type="button"
    >
      {status === "saving" ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
      {status === "saving"
        ? labels.working
        : status === "saved"
          ? labels.saved
          : status === "error"
            ? labels.needsLogin
            : labels.complete}
    </button>
  );
}
