"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Bug, Sparkles } from "lucide-react";
import { formatMessage, t, type Language } from "@/lib/i18n";
import type { MentorHintLevel, MentorMode } from "@/lib/mentor/prompt";

const MAX_HINT_LEVEL = 3;
const MIN_EFFORT_LENGTH = 4;

function getErrorKey(message: string) {
  try {
    const parsed = JSON.parse(message) as { error?: unknown };
    if (typeof parsed.error === "string") {
      return parsed.error;
    }
  } catch {
    // The stream can return a plain, safe error key.
  }

  return message.trim();
}

function assistantText(message: { parts: Array<{ type: string; text?: string }> }) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

export function LessonAiHint({
  effort = "",
  isAuthenticated,
  language,
  lessonId
}: {
  effort?: string;
  isAuthenticated: boolean;
  language: Language;
  lessonId: string;
}) {
  const copy = t(language);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(isAuthenticated);
  const [activeMode, setActiveMode] = useState<MentorMode | null>(null);
  const [effortAtLastRequest, setEffortAtLastRequest] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const pendingEffort = useRef("");
  const historyRef = useRef<HTMLDivElement | null>(null);

  const refreshUsage = useCallback(async (signal?: AbortSignal) => {
    setUsageLoading(true);
    let response: Response;
    try {
      response = await fetch("/api/mentor", { signal });
    } catch {
      if (!signal?.aborted) {
        setUsageLoading(false);
      }
      return;
    }

    if (signal?.aborted) {
      return;
    }

    setUsageLoading(false);

    if (!response.ok) {
      return;
    }

    const body = (await response.json()) as { remaining?: number };
    setRemaining(body.remaining ?? null);
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/mentor",
        fetch: async (input, init) => {
          const response = await fetch(input, init);
          const nextRemaining = Number(response.headers.get("X-Mentor-Remaining"));
          if (Number.isInteger(nextRemaining) && nextRemaining >= 0) {
            setRemaining(nextRemaining);
          }
          return response;
        }
      }),
    []
  );

  const { clearError, error, messages, sendMessage, status } = useChat({
    transport,
    onFinish: () => {
      setEffortAtLastRequest(pendingEffort.current);
      void refreshUsage();
      requestAnimationFrame(() => {
        historyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const controller = new AbortController();
    void refreshUsage(controller.signal);

    return () => controller.abort();
  }, [isAuthenticated, refreshUsage]);

  const assistantMessages = messages.filter((message) => message.role === "assistant");
  const hintHistory = assistantMessages
    .map((message) => assistantText(message))
    .filter((text) => text.length > 0);
  const hintsUsed = hintHistory.length;
  const busy = status === "submitted" || status === "streaming";
  const limitReached = remaining === 0 && !usageLoading;
  const taskLimitReached = hintsUsed >= MAX_HINT_LEVEL;
  const hasEffort = effort.trim().length >= MIN_EFFORT_LENGTH;
  const hasNewAttempt = effortAtLastRequest === null || effort.trim() !== effortAtLastRequest;
  const primaryMode: MentorMode = hasEffort ? "review" : "start";
  const primaryLabel = hasEffort ? copy.mentor.primaryReview : copy.mentor.primaryStart;
  const canAskPrimary = !busy && !limitReached && !taskLimitReached && (hintsUsed === 0 || hasNewAttempt);
  const canAskExplain =
    canAskPrimary && hasEffort && (hintsUsed === 0 || hasNewAttempt);

  function resolveError(errorKey?: string) {
    if (!errorKey) {
      return copy.mentor.errors.default;
    }

    const known = copy.mentor.errors[errorKey as keyof typeof copy.mentor.errors];
    return known ?? copy.mentor.errors.default;
  }

  async function askMentor(mode: MentorMode) {
    if (busy || limitReached || taskLimitReached) {
      return;
    }

    if (mode !== "start" && !hasEffort) {
      setLocalError("effort_required");
      return;
    }

    if (hintsUsed > 0 && !hasNewAttempt) {
      setLocalError("new_attempt_required");
      return;
    }

    const hintLevel = Math.min(hintsUsed + 1, MAX_HINT_LEVEL) as MentorHintLevel;
    setLocalError(null);
    clearError();
    setActiveMode(mode);
    pendingEffort.current = effort.trim();

    const modeTitle =
      mode === "start"
        ? copy.mentor.modeStart
        : mode === "review"
          ? copy.mentor.modeReview
          : copy.mentor.modeExplain;

    await sendMessage(
      { text: modeTitle },
      {
        body: {
          lessonId,
          language,
          mode,
          hintLevel,
          effort
        }
      }
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-xl border border-ink/10 bg-ink/[0.03] p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-ink">
          <Bot className="size-4 text-violet" />
          {copy.mentor.title}
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/65">{copy.mentor.guestMessage}</p>
        <Link
          className="mt-3 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-bold text-paper"
          href="/register"
        >
          {copy.mentor.guestCta}
        </Link>
      </section>
    );
  }

  const displayedError = localError ?? (error ? getErrorKey(error.message) : null);
  let guidance: string | null = null;
  if (!limitReached && !taskLimitReached) {
    if (hintsUsed > 0 && !hasNewAttempt) {
      guidance = copy.mentor.tryBeforeNext;
    } else if (primaryMode === "review") {
      guidance = copy.mentor.guidanceReviewReady;
    } else {
      guidance = copy.mentor.guidanceStartReady;
    }
  }

  return (
    <section className="rounded-xl border border-violet/20 bg-violet/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <Sparkles className="size-4 text-violet" />
            {copy.mentor.title}
          </div>
          <p className="mt-1 text-sm leading-6 text-ink/65">{copy.mentor.subtitle}</p>
        </div>
        {usageLoading ? (
          <p className="shrink-0 text-xs font-semibold text-ink/50">{copy.mentor.usageLoading}</p>
        ) : remaining !== null ? (
          <p className="shrink-0 text-xs font-semibold text-ink/50">
            {formatMessage(copy.mentor.remaining, { remaining })}
          </p>
        ) : null}
      </div>

      <div className="mt-4 border-t border-violet/15 pt-4">
        {limitReached ? (
          <p className="rounded-lg bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">
            {copy.mentor.errors.daily_limit_reached}
          </p>
        ) : taskLimitReached ? (
          <div className="rounded-lg border border-mint/30 bg-white px-4 py-3">
            <p className="text-sm font-bold text-ink">{copy.mentor.taskLimitTitle}</p>
            <p className="mt-1 text-sm leading-6 text-ink/65">{copy.mentor.taskLimitMessage}</p>
          </div>
        ) : (
          <>
            {guidance ? <p className="text-sm leading-6 text-ink/60">{guidance}</p> : null}

            <button
              className="focus-ring mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
              disabled={!canAskPrimary}
              onClick={() => void askMentor(primaryMode)}
              type="button"
            >
              <Sparkles className="size-4" />
              {primaryLabel}
            </button>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                className="text-sm font-bold text-violet underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-45 disabled:no-underline"
                disabled={!canAskExplain}
                onClick={() => void askMentor("explain")}
                type="button"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Bug className="size-3.5" />
                  {copy.mentor.modeExplain}
                </span>
              </button>
              {activeMode && busy ? (
                <span className="text-xs font-semibold text-ink/45">{copy.mentor.working}</span>
              ) : null}
            </div>
          </>
        )}

        {busy ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-ink/65">
            <Bot className="size-4 animate-pulse text-violet" />
            {copy.mentor.working}
          </div>
        ) : null}

        {displayedError ? (
          <p className="mt-3 rounded-lg bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">
            {resolveError(displayedError)}
          </p>
        ) : null}

        {hintHistory.length > 0 ? (
          <div className="mt-4 space-y-3" ref={historyRef}>
            {hintHistory.map((hint, index) => (
              <div className="rounded-xl border border-mint/30 bg-white px-4 py-4" key={`mentor-hint-${index + 1}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                  {formatMessage(copy.mentor.hintLevel, { level: index + 1 })}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/80">{hint}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
