"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import { formatMessage, t, type Language } from "@/lib/i18n";

export function LessonAiHint({
  effort,
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
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usageLoading, setUsageLoading] = useState(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadUsage() {
      setUsageLoading(true);

      const response = await fetch("/api/mentor");
      if (cancelled) {
        return;
      }

      setUsageLoading(false);

      if (!response.ok) {
        return;
      }

      const body = (await response.json()) as {
        remaining?: number;
        limit?: number;
      };

      setRemaining(body.remaining ?? null);
    }

    void loadUsage();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function resolveError(errorKey?: string) {
    if (!errorKey) {
      return copy.mentor.errors.default;
    }

    const known = copy.mentor.errors[errorKey as keyof typeof copy.mentor.errors];
    return known ?? copy.mentor.errors.default;
  }

  async function askMentor() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        language,
        question,
        effort
      })
    });

    setLoading(false);

    const body = (await response.json()) as {
      hint?: string;
      remaining?: number;
      limit?: number;
      error?: string;
    };

    if (body.remaining !== undefined) {
      setRemaining(body.remaining);
    }

    if (!response.ok) {
      setHint(null);
      setMessage(resolveError(body.error));
      return;
    }

    setHint(body.hint ?? null);
    setMessage(copy.mentor.success);
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-lg border border-ink/10 bg-ink/[0.03] p-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase text-violet">
          <Bot className="size-4" />
          {copy.mentor.title}
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/70">{copy.mentor.guestMessage}</p>
        <Link className="mt-3 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper" href="/register">
          {copy.mentor.guestCta}
        </Link>
      </section>
    );
  }

  const limitReached = remaining === 0 && !usageLoading;

  return (
    <section className="rounded-lg border border-violet/20 bg-violet/5 p-4">
      <div className="flex items-center gap-2 text-sm font-bold uppercase text-violet">
        <Sparkles className="size-4" />
        {copy.mentor.title}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink/70">{copy.mentor.subtitle}</p>

      {usageLoading ? (
        <p className="mt-3 text-xs font-semibold text-ink/55">{copy.mentor.usageLoading}</p>
      ) : remaining !== null ? (
        <p className="mt-3 text-xs font-semibold text-ink/55">
          {formatMessage(copy.mentor.remaining, { remaining })}
        </p>
      ) : null}

      {limitReached ? (
        <p className="mt-3 rounded-md bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">
          {copy.mentor.errors.daily_limit_reached}
        </p>
      ) : (
        <>
          <label className="mt-4 block text-sm font-bold text-ink/70" htmlFor={`mentor-question-${lessonId}`}>
            {copy.mentor.questionLabel}
          </label>
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm leading-6"
            id={`mentor-question-${lessonId}`}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={copy.mentor.questionPlaceholder}
            value={question}
          />

          <button
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
            disabled={loading || question.trim().length < 8}
            onClick={askMentor}
            type="button"
          >
            <Bot className="size-4" />
            {loading ? copy.mentor.working : copy.mentor.askButton}
          </button>
        </>
      )}

      {message ? (
        <p className={`mt-3 rounded-md px-4 py-3 text-sm font-semibold ${hint ? "bg-mint/15 text-ink" : "bg-coral/15 text-ink"}`}>
          {message}
        </p>
      ) : null}

      {hint ? (
        <div className="mt-3 rounded-md border border-mint/25 bg-white/90 px-4 py-3 text-sm leading-6 text-ink/80 whitespace-pre-wrap">
          {hint}
        </div>
      ) : null}
    </section>
  );
}
