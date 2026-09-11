"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

export function ActionToast({
  message,
  tone,
  onDismiss,
  closeLabel,
  duration = 4000
}: {
  message: string;
  tone: "success" | "error";
  onDismiss: () => void;
  closeLabel: string;
  duration?: number;
}) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [duration, message]);

  const Icon = tone === "success" ? CheckCircle2 : CircleAlert;

  return (
    <div
      aria-atomic="true"
      className={`fixed left-1/2 top-20 z-[80] flex w-[min(92vw,30rem)] -translate-x-1/2 items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
        tone === "success" ? "border-mint/50 bg-ink text-paper" : "border-coral/50 bg-white text-ink"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${tone === "success" ? "text-mint" : "text-coral"}`} />
      <p className="min-w-0 flex-1 text-sm font-bold leading-6">{message}</p>
      <button className="focus-ring -mr-1 grid size-8 shrink-0 place-items-center rounded-lg" onClick={onDismiss} type="button">
        <span className="sr-only">{closeLabel}</span>
        <X className="size-4" />
      </button>
    </div>
  );
}
