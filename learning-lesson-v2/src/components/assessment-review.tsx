import { CheckCircle2, XCircle } from "lucide-react";
import type { AssessmentReviewQuestion } from "@/lib/assessments/types";
import { t, type Language } from "@/lib/i18n";

export function AssessmentReview({ language, questions }: { language: Language; questions: AssessmentReviewQuestion[] }) {
  const copy = t(language).assessment;

  return (
    <section>
      <h2 className="text-xl font-black">{copy.reviewTitle}</h2>
      <div className="mt-4 space-y-4">
        {questions.map((question, index) => (
          <article
            className={`rounded-xl border p-5 ${
              question.isCorrect ? "border-mint/60 bg-mint/10" : "border-coral/35 bg-coral/5"
            }`}
            key={question.id}
          >
            <div className="flex items-start gap-3">
              {question.isCorrect ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#168864]" />
              ) : (
                <XCircle className="mt-0.5 size-5 shrink-0 text-coral" />
              )}
              <div>
                <p className="font-black">
                  {index + 1}. {question.prompt}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-bold">{copy.yourAnswer}:</span>{" "}
                  {question.options[question.selectedOption]}
                </p>
                {!question.isCorrect ? (
                  <p className="mt-1 text-sm">
                    <span className="font-bold">{copy.correctAnswerLabel}:</span>{" "}
                    {question.options[question.correctOption]}
                  </p>
                ) : null}
                {question.explanation ? (
                  <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm leading-6">
                    <span className="font-bold">{copy.explanation}:</span> {question.explanation}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
