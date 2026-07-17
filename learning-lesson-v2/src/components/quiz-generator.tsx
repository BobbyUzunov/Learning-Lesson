"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import {
  createSeededRandom,
  generateQuizQuestions,
  getQuizTopicForLesson,
  localizeQuizQuestion
} from "@/lib/quiz/helpers";
import type { QuizAttempt, QuizContent, QuizQuestion } from "@/lib/quiz/types";
import { t, type Language } from "@/lib/i18n";

export function QuizGenerator({
  language,
  lessonId,
  onResult,
  quizContent
}: {
  language: Language;
  lessonId: string;
  onResult?: (attempt: QuizAttempt | null) => void;
  quizContent: QuizContent;
}) {
  const copy = t(language);
  const topic = getQuizTopicForLesson(quizContent, lessonId);
  const [seed, setSeed] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => {
    return generateQuizQuestions(quizContent, topic, 3, createSeededRandom(`${lessonId}:${seed}`));
  }, [lessonId, quizContent, seed, topic]);

  const correctCount = submitted
    ? questions.reduce((total, question) => total + (answers[question.id] === question.correctIndex ? 1 : 0), 0)
    : 0;

  function regenerate() {
    setAnswers({});
    setSubmitted(false);
    setSeed((value) => value + 1);
    onResult?.(null);
  }

  function checkAnswers() {
    const answerList = questions.map((question) => ({
      questionId: question.id,
      selectedIndex: answers[question.id]
    }));
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
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-violet">
            <Sparkles className="size-4" />
            {copy.quiz.title}
          </div>
          <p className="mt-2 text-sm text-ink/70">{copy.quiz.subtitle}</p>
        </div>
        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink/5"
          onClick={regenerate}
          type="button"
        >
          <RefreshCw className="size-4" />
          {copy.quiz.regenerate}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {questions.map((question, index) => (
          <QuizQuestionCard
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

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {submitted ? (
          <p className={`inline-flex items-center gap-2 text-sm font-bold ${correctCount * 3 >= questions.length * 2 ? "text-ink" : "text-coral"}`}>
            <CheckCircle2 className="size-4 text-mint" />
            {copy.quiz.score}: {correctCount} / {questions.length}. {correctCount * 3 >= questions.length * 2 ? copy.quiz.passed : copy.quiz.tryAgain}
          </p>
        ) : (
          <p className="text-sm text-ink/60">{copy.quiz.answerAll}</p>
        )}
        <button
          className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
          disabled={submitted || questions.some((question) => answers[question.id] === undefined)}
          onClick={checkAnswers}
          type="button"
        >
          {copy.quiz.checkAnswers}
        </button>
      </div>
    </div>
  );
}

function QuizQuestionCard({
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
  question: QuizQuestion;
  submitted: boolean;
}) {
  const copy = t(language);
  const localized = localizeQuizQuestion(question, language);
  const selected = answers[question.id];

  return (
    <article className="rounded-lg border border-ink/10 bg-paper/60 p-4">
      <p className="text-sm font-bold uppercase text-ink/50">
        {copy.quiz.questionLabel} {index + 1}
      </p>
      <h3 className="mt-2 font-black text-ink">{localized.question}</h3>
      <div className="mt-3 grid gap-2">
        {localized.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isCorrect = submitted && question.correctIndex === optionIndex;
          const isWrong = submitted && isSelected && question.correctIndex !== optionIndex;

          return (
            <button
              className={`focus-ring rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                isCorrect
                  ? "border-mint bg-mint/20 text-ink"
                  : isWrong
                    ? "border-coral/40 bg-coral/10 text-ink"
                    : isSelected
                      ? "border-violet bg-violet/10 text-ink"
                      : "border-ink/10 bg-white text-ink/80 hover:border-violet/30"
              }`}
              disabled={submitted}
              key={`${question.id}-${option}`}
              onClick={() => onSelect(optionIndex)}
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
