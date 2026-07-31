"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleX, RefreshCw, Sparkles } from "lucide-react";
import {
  createKnowledgeCheckAnswer,
  createSeededRandom,
  generateKnowledgeCheckQuestions,
  getKnowledgeCheckTopicForLesson,
  localizeKnowledgeCheckQuestion
} from "@/lib/knowledge-check/helpers";
import type {
  KnowledgeCheckAttempt,
  KnowledgeCheckContent,
  KnowledgeCheckQuestion
} from "@/lib/knowledge-check/types";
import { t, type Language } from "@/lib/i18n";

export function KnowledgeCheck({
  content,
  language,
  lessonId,
  onResult
}: {
  content: KnowledgeCheckContent;
  language: Language;
  lessonId: string;
  onResult?: (attempt: KnowledgeCheckAttempt | null) => void;
}) {
  const copy = t(language);
  const topic = getKnowledgeCheckTopicForLesson(content, lessonId);
  const [seed, setSeed] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => {
    return topic
      ? generateKnowledgeCheckQuestions(content, topic, 3, createSeededRandom(`${lessonId}:${seed}`))
      : [];
  }, [content, lessonId, seed, topic]);
  const knowledgeCheckUnavailable = questions.length === 0;

  const correctCount = submitted
    ? questions.reduce((total, question) => total + (answers[question.id] === question.correctIndex ? 1 : 0), 0)
    : 0;
  const passed = submitted && correctCount * 3 >= questions.length * 2;

  function regenerate() {
    setAnswers({});
    setSubmitted(false);
    setSeed((value) => value + 1);
    onResult?.(null);
  }

  function checkAnswers() {
    if (knowledgeCheckUnavailable) {
      onResult?.(null);
      return;
    }

    const answerList = questions.map((question) =>
      createKnowledgeCheckAnswer(question, answers[question.id])
    );
    const correct = questions.reduce(
      (total, question) => total + (answers[question.id] === question.correctIndex ? 1 : 0),
      0
    );

    setSubmitted(true);
    onResult?.({
      answers: answerList,
      correct,
      total: questions.length,
      passed: questions.length > 0 && correct * 3 >= questions.length * 2
    });
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white/85 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase text-violet">
            <Sparkles className="size-4" />
            {copy.knowledgeCheck.title}
          </h2>
          <p className="mt-2 text-sm text-ink/70">{copy.knowledgeCheck.subtitle}</p>
        </div>
        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink/5 disabled:opacity-60"
          disabled={knowledgeCheckUnavailable}
          onClick={regenerate}
          type="button"
        >
          <RefreshCw className="size-4" />
          {copy.knowledgeCheck.regenerate}
        </button>
      </div>

      {knowledgeCheckUnavailable ? (
        <p className="mt-5 rounded-md bg-coral/10 px-4 py-3 text-sm font-bold text-ink" role="alert">
          {copy.knowledgeCheck.unavailable}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        {questions.map((question, index) => (
          <KnowledgeCheckQuestionCard
            answers={answers}
            index={index}
            key={question.id}
            language={language}
            onSelect={(optionIndex) => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
            question={question}
            submitted={submitted}
          />
        ))}
      </div>

      {!knowledgeCheckUnavailable ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {submitted ? (
            <p
              aria-live="polite"
              className={`inline-flex items-center gap-2 text-sm font-bold ${passed ? "text-ink" : "text-coral"}`}
              role="status"
            >
              {passed ? (
                <CheckCircle2 aria-hidden="true" className="size-4 text-mint" />
              ) : (
                <CircleX aria-hidden="true" className="size-4 text-coral" />
              )}
              {copy.knowledgeCheck.score}: {correctCount} / {questions.length}. {passed ? copy.knowledgeCheck.passed : copy.knowledgeCheck.tryAgain}
            </p>
          ) : (
            <p className="text-sm text-ink/60">{copy.knowledgeCheck.answerAll}</p>
          )}
          <button
            className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
            disabled={submitted || questions.some((question) => answers[question.id] === undefined)}
            onClick={checkAnswers}
            type="button"
          >
            {copy.knowledgeCheck.checkAnswers}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function KnowledgeCheckQuestionCard({
  answers,
  index,
  language,
  onSelect,
  question,
  submitted
}: {
  answers: Record<string, number>;
  index: number;
  language: Language;
  onSelect: (optionIndex: number) => void;
  question: KnowledgeCheckQuestion;
  submitted: boolean;
}) {
  const copy = t(language);
  const localized = localizeKnowledgeCheckQuestion(question, language);
  const selected = answers[question.id];
  const questionHeadingId = `knowledge-check-question-${question.id}`;

  return (
    <article className="rounded-lg border border-ink/10 bg-paper/60 p-4">
      <p className="text-sm font-bold uppercase text-ink/50">
        {copy.knowledgeCheck.questionLabel} {index + 1}
      </p>
      <h3 className="mt-2 font-black text-ink" id={questionHeadingId}>
        {localized.question}
      </h3>
      <div
        aria-labelledby={questionHeadingId}
        className="mt-3 grid gap-2"
        role="radiogroup"
      >
        {localized.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isCorrect = submitted && question.correctIndex === optionIndex;
          const isWrong = submitted && isSelected && question.correctIndex !== optionIndex;

          return (
            <button
              aria-checked={isSelected}
              aria-label={`${option}${
                submitted
                  ? ` — ${isCorrect ? copy.knowledgeCheck.correctAnswer : isWrong ? copy.knowledgeCheck.incorrectAnswer : copy.knowledgeCheck.notSelectedAnswer}`
                  : ""
              }`}
              aria-disabled={submitted}
              className={`focus-ring rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                isCorrect
                  ? "border-mint bg-mint/20 text-ink"
                  : isWrong
                    ? "border-coral/40 bg-coral/10 text-ink"
                    : isSelected
                      ? "border-violet bg-violet/10 text-ink"
                      : "border-ink/10 bg-white text-ink/80 hover:border-violet/30"
              }`}
              key={`${question.id}-${option}`}
              onClick={() => {
                if (!submitted) {
                  onSelect(optionIndex);
                }
              }}
              role="radio"
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
      {submitted ? (
        <p className="mt-3 rounded-md bg-ink/5 px-3 py-2 text-sm leading-6 text-ink/75">{localized.explanation}</p>
      ) : null}
    </article>
  );
}

/** @deprecated Use KnowledgeCheck. Kept for old local duplicate files and cached imports. */
export function QuizGenerator({
  language,
  lessonId,
  onResult,
  quizContent
}: {
  language: Language;
  lessonId: string;
  onResult?: (attempt: KnowledgeCheckAttempt | null) => void;
  quizContent: KnowledgeCheckContent;
}) {
  return (
    <KnowledgeCheck
      content={quizContent}
      language={language}
      lessonId={lessonId}
      onResult={onResult}
    />
  );
}
