"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Bug, ChevronDown, ChevronUp, Compass, SearchCheck, Sparkles } from "lucide-react";
import { formatMessage, t, type Language } from "@/lib/i18n";
import type { MentorHintLevel, MentorMode } from "@/lib/mentor/prompt";

const MAX_HINT_LEVEL = 3;

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
  const [expanded, setExpanded] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(isAuthenticated);
  const [activeMode, setActiveMode] = useState<MentorMode | null>(null);
  const [effortAtLastRequest, setEffortAtLastRequest] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const pendingEffort = useRef("");

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
  const hintsUsed = assistantMessages.length;
  const latestAssistant = assistantMessages.at(-1);
  const hint = latestAssistant?.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
  const busy = status === "submitted" || status === "streaming";
  const limitReached = remaining === 0 && !usageLoading;
  const taskLimitReached = hintsUsed >= MAX_HINT_LEVEL;
  const hasNewAttempt = effortAtLastRequest === null || effort.trim() !== effortAtLastRequest;

  const modes: Array<{
    id: MentorMode;
    title: string;
    description: string;
    icon: typeof Compass;
    requiresEffort: boolean;
  }> = [
    {
      id: "start",
      title: copy.mentor.modeStart,
      description: copy.mentor.modeStartDescription,
      icon: Compass,
      requiresEffort: false
    },
    {
      id: "review",
      title: copy.mentor.modeReview,
      description: copy.mentor.modeReviewDescription,
      icon: SearchCheck,
      requiresEffort: true
    },
    {
      id: "explain",
      title: copy.mentor.modeExplain,
      description: copy.mentor.modeExplainDescription,
      icon: Bug,
      requiresEffort: true
    }
  ];

  function resolveError(errorKey?: string) {
    if (!errorKey) {
      return copy.mentor.errors.default;
    }

    const known = copy.mentor.errors[errorKey as keyof typeof copy.mentor.errors];
    return known ?? copy.mentor.errors.default;
  }

  async function askMentor(mode: MentorMode) {
    const modeConfig = modes.find((item) => item.id === mode);
    if (!modeConfig || busy || limitReached || taskLimitReached) {
      return;
    }

    if (modeConfig.requiresEffort && effort.trim().length < 4) {
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

    await sendMessage(
      { text: modeConfig.title },
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
        <Link className="mt-3 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-bold text-paper" href="/login">
          {copy.mentor.guestCta}
        </Link>
      </section>
    );
  }

  const displayedError = localError ?? (error ? getErrorKey(error.message) : null);
  const displayLevel = Math.max(1, Math.min(hintsUsed || hintsUsed + 1, MAX_HINT_LEVEL));

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
        <button
          aria-expanded={expanded}
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs font-bold text-ink"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? copy.mentor.close : copy.mentor.open}
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 border-t border-violet/15 pt-4">
          {usageLoading ? (
            <p className="text-xs font-semibold text-ink/50">{copy.mentor.usageLoading}</p>
          ) : remaining !== null ? (
            <p className="text-xs font-semibold text-ink/50">
              {formatMessage(copy.mentor.remaining, { remaining })}
            </p>
          ) : null}

          {limitReached ? (
            <p className="mt-3 rounded-lg bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">
              {copy.mentor.errors.daily_limit_reached}
            </p>
          ) : taskLimitReached ? (
            <div className="mt-3 rounded-lg border border-mint/30 bg-white px-4 py-3">
              <p className="text-sm font-bold text-ink">{copy.mentor.taskLimitTitle}</p>
              <p className="mt-1 text-sm leading-6 text-ink/65">{copy.mentor.taskLimitMessage}</p>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm font-bold text-ink">{copy.mentor.chooseHelp}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const disabled = busy || (hintsUsed > 0 && !hasNewAttempt);

                  return (
                    <button
                      className={`focus-ring rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        activeMode === mode.id
                          ? "border-violet/40 bg-white shadow-sm"
                          : "border-ink/10 bg-white/70 hover:border-violet/30"
                      }`}
                      disabled={disabled}
                      key={mode.id}
                      onClick={() => void askMentor(mode.id)}
                      type="button"
                    >
                      <Icon className="size-4 text-violet" />
                      <span className="mt-2 block text-sm font-bold text-ink">{mode.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-ink/55">{mode.description}</span>
                    </button>
                  );
                })}
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

          {hint ? (
            <div className="mt-4 rounded-xl border border-mint/30 bg-white px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                {formatMessage(copy.mentor.hintLevel, { level: displayLevel })}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/80">{hint}</p>
              {!taskLimitReached && !hasNewAttempt ? (
                <p className="mt-3 border-t border-ink/10 pt-3 text-xs font-semibold text-ink/55">
                  {copy.mentor.tryBeforeNext}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
