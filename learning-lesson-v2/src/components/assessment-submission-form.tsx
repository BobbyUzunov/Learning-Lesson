"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssessmentQuestion } from "@/lib/assessments/types";
import { assessmentDraftKey, type AssessmentAnswersDraft } from "@/lib/draft-storage";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { t, type Language } from "@/lib/i18n";

export function AssessmentSubmissionForm({
  assessmentId,
  language,
  questions
}: {
  assessmentId: string;
  language: Language;
  questions: AssessmentQuestion[];
}) {
  const copy = t(language).assessment;
  const router = useRouter();
  const {
    value: draft,
    setValue: setDraft,
    status: draftStatus,
    clearDraft
  } = useDraftAutosave<AssessmentAnswersDraft>({
    key: assessmentDraftKey(assessmentId),
    initialValue: { answers: {} }
  });
  const answers = draft.answers;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (Object.keys(answers).length !== questions.length) {
      setError(copy.unansweredError);
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        setError(copy.submitError);
        return;
      }

      clearDraft();
      router.refresh();
    } catch {
      setError(copy.submitError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {draftStatus === "restored" || draftStatus === "saved" ? (
        <p className="text-xs font-semibold text-ink/50">
          {draftStatus === "restored" ? copy.draftRestored : copy.draftSaved}
        </p>
      ) : null}

      {questions.map((question, questionIndex) => (
        <fieldset className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft" key={question.id}>
          <legend className="w-full">
            <span className="text-xs font-bold uppercase tracking-wide text-violet">
              {copy.questionLabel} {questionIndex + 1} · {question.points} {copy.points}
            </span>
            <span className="mt-2 block text-lg font-black leading-7">{question.prompt}</span>
          </legend>
          <div className="mt-4 grid gap-2">
            {question.options.map((option, optionIndex) => {
              const checked = answers[question.id] === optionIndex;
              return (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    checked ? "border-violet bg-violet/10" : "border-ink/10 bg-white hover:border-ink/25"
                  }`}
                  key={`${question.id}-${optionIndex}`}
                >
                  <input
                    checked={checked}
                    className="mt-0.5 size-5 accent-violet"
                    name={`question-${question.id}`}
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        answers: { ...current.answers, [question.id]: optionIndex }
                      }))
                    }
                    type="radio"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error ? <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm font-bold text-coral">{error}</p> : null}

      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-ink px-6 py-3 font-bold text-paper disabled:opacity-60 sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? copy.submitting : copy.submitButton}
      </button>
    </form>
  );
}
