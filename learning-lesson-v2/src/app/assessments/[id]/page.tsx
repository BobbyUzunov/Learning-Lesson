import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { AssessmentReview } from "@/components/assessment-review";
import { AssessmentSubmissionForm } from "@/components/assessment-submission-form";
import { isAssessmentExpired, type AssessmentType } from "@/lib/assessments/types";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import {
  getMyAssessmentAttempt,
  getMyAssessmentReview,
  getStudentAssessmentById
} from "@/lib/supabase/assessments";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

function typeLabel(type: AssessmentType, copy: ReturnType<typeof t>["assessment"]) {
  if (type === "diagnostic") return copy.typeDiagnostic;
  if (type === "summative") return copy.typeSummative;
  return copy.typeFormative;
}

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language).assessment;
  await requireUser();
  const { id } = await params;
  const [assessment, attempt] = await Promise.all([
    getStudentAssessmentById(id),
    getMyAssessmentAttempt(id)
  ]);

  if (!assessment) {
    notFound();
  }

  const review = attempt ? await getMyAssessmentReview(id) : [];
  const expired = isAssessmentExpired(assessment);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink" href="/assessments">
        <ArrowLeft className="size-4" />
        {copy.backToAssessments}
      </Link>

      <section className="mt-5 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft sm:p-6">
        <p className="text-xs font-bold uppercase text-violet">
          {typeLabel(assessment.type, copy)} · {assessment.classroomName}
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{assessment.title}</h1>
        {assessment.description ? <p className="mt-3 leading-7 text-ink/70">{assessment.description}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-ink/55">
          <span>{assessment.questionCount} {copy.questionCount}</span>
          {assessment.durationMinutes ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" /> {assessment.durationMinutes} {copy.minutes}
            </span>
          ) : null}
        </div>
      </section>

      {attempt ? (
        <div className="mt-6 space-y-6">
          <section className="rounded-xl bg-ink p-6 text-paper">
            <p className="text-sm font-bold uppercase text-mint">{copy.resultTitle}</p>
            <p className="mt-3 text-5xl font-black">{attempt.percentage}%</p>
            <p className="mt-2 text-sm text-paper/65">
              {attempt.score}/{attempt.maxScore} {copy.points}
            </p>
          </section>
          <AssessmentReview language={language} questions={review} />
        </div>
      ) : expired ? (
        <p className="mt-6 rounded-xl bg-coral/10 px-5 py-4 font-bold text-coral">
          {assessment.status === "closed" ? copy.closedMessage : copy.expiredMessage}
        </p>
      ) : (
        <div className="mt-6">
          <div className="mb-5 rounded-xl bg-violet/10 px-5 py-4 text-sm leading-6 text-ink/75">
            <p className="font-bold">{copy.oneAttempt}</p>
            <p className="mt-1">{copy.solveInstructions}</p>
          </div>
          <AssessmentSubmissionForm assessmentId={assessment.id} language={language} questions={assessment.questions} />
        </div>
      )}
    </main>
  );
}
