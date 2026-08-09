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
  KnowledgeCheckGradeResult,
  KnowledgeCheckGradeResultItem,
  ShuffledKnowledgeCheckQuestion
} from "@/lib/knowledge-check";
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
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [gradeResult, setGradeResult] = useState<KnowledgeCheckGradeResult | null>(null);

  const questions = useMemo(() => {
    return topic
      ? generateKnowledgeCheckQuestions(content, topic, 3, createSeededRandom(`${lessonId}:${seed}`))
      : [];
  }, [content, lessonId, seed, topic]);
  const knowledgeCheckUnavailable = questions.length === 0;

  const correctCount = gradeResult?.correct ?? 0;
  const passed = Boolean(gradeResult?.passed);
  const resultById = useMemo(() => {
    const map = new Map<string, KnowledgeCheckGradeResultItem>();
    for (const item of gradeResult?.results ?? []) {
      map.set(item.questionId, item);
    }
    return map;
  }, [gradeResult]);

  function regenerate() {
    setAnswers({});
    setSubmitted(false);
    setGrading(false);
    setGradeError(null);
    setGradeResult(null);
    setSeed((value) => value + 1);
    onResult?.(null);
  }

  async function checkAnswers() {
    if (knowledgeCheckUnavailable || grading) {
      onResult?.(null);
      return;
    }

    const answerList = questions.map((question) =>
      createKnowledgeCheckAnswer(question, answers[question.id])
    );

    setGrading(true);
    setGradeError(null);

    let response: Response;
    try {
      response = await fetch("/api/knowledge-check/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          knowledgeCheckAnswers: answerList
        })
      });
    } catch {
      setGrading(false);
      setGradeError(copy.lesson.saveError);
      onResult?.(null);
      return;
    }

    setGrading(false);

    if (!response.ok) {
      let message: string = copy.lesson.saveError;
      try {
        const body = (await response.json()) as { error?: string };
        if (body.error === "quiz_unavailable" || body.error === "knowledge_check_unavailable") {
          message = copy.knowledgeCheck.unavailable;
        } else if (body.error === "quiz_not_passed" || body.error === "knowledge_check_not_passed") {
          message = copy.lesson.knowledgeCheckVerificationFailed;
        }
      } catch {
        // Keep fallback.
      }
      setGradeError(message);
      setSubmitted(false);
      setGradeResult(null);
      onResult?.(null);
      return;
    }

    const graded = (await response.json()) as KnowledgeCheckGradeResult;
    setGradeResult(graded);
    setSubmitted(true);
    onResult?.({
      answers: graded.answers,
      correct: graded.correct,
      total: graded.total,
      passed: graded.passed
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
          disabled={knowledgeCheckUnavailable || grading}
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
            grade={resultById.get(question.id) ?? null}
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
          {gradeError ? (
            <p className="text-sm font-bold text-coral" role="alert">
              {gradeError}
            </p>
          ) : submitted && gradeResult ? (
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
              {copy.knowledgeCheck.score}: {correctCount} / {questions.length}.{" "}
              {passed ? copy.knowledgeCheck.passed : copy.knowledgeCheck.tryAgain}
            </p>
          ) : (
            <p className="text-sm text-ink/60">{copy.knowledgeCheck.answerAll}</p>
          )}
          <button
            className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
            disabled={
              submitted ||
              grading ||
              questions.some((question) => answers[question.id] === undefined)
            }
            onClick={() => {
              void checkAnswers();
            }}
            type="button"
          >
            {grading ? copy.login.working : copy.knowledgeCheck.checkAnswers}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function KnowledgeCheckQuestionCard({
  answers,
  grade,
  index,
  language,
  onSelect,
  question,
  submitted
}: {
  answers: Record<string, number>;
  grade: KnowledgeCheckGradeResultItem | null;
  index: number;
  language: Language;
  onSelect: (optionIndex: number) => void;
  question: ShuffledKnowledgeCheckQuestion;
  submitted: boolean;
}) {
  const copy = t(language);
  const localized = localizeKnowledgeCheckQuestion(question, language);
  const selected = answers[question.id];
  const questionHeadingId = `knowledge-check-question-${question.id}`;
  const explanation =
    language === "bg" ? grade?.explanationBg || grade?.explanation : grade?.explanation;

  return (
    <article className="rounded-lg border border-ink/10 bg-paper/60 p-4">
      <p className="text-sm font-bold uppercase text-ink/50">
        {copy.knowledgeCheck.questionLabel} {index + 1}
      </p>
      <h3 className="mt-2 font-black text-ink" id={questionHeadingId}>
        {localized.question}
      </h3>
      <div aria-labelledby={questionHeadingId} className="mt-3 grid gap-2" role="radiogroup">
        {localized.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const originalIndex = question.originalOptionIndexes[optionIndex];
          const isCorrect = submitted && grade !== null && grade.correctIndex === originalIndex;
          const isWrong = submitted && isSelected && grade !== null && !grade.isCorrect && !isCorrect;

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
      {submitted && explanation ? (
        <p className="mt-3 rounded-md bg-ink/5 px-3 py-2 text-sm leading-6 text-ink/75">{explanation}</p>
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
