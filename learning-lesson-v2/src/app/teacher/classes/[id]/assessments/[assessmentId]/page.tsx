import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssessmentReport } from "@/components/teacher/assessment-report";
import { CloseAssessmentButton } from "@/components/teacher/close-assessment-button";
import { summarizeAssessmentReport, type AssessmentType } from "@/lib/assessments/types";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import {
  getAssessmentQuestionAnalysis,
  getAssessmentReport,
  getTeacherAssessmentById
} from "@/lib/supabase/assessments";

export const dynamic = "force-dynamic";

function typeLabel(type: AssessmentType, copy: ReturnType<typeof t>["assessment"]) {
  if (type === "diagnostic") return copy.typeDiagnostic;
  if (type === "summative") return copy.typeSummative;
  return copy.typeFormative;
}

export default async function TeacherAssessmentReportPage({
  params
}: {
  params: Promise<{ id: string; assessmentId: string }>;
}) {
  const language = await getLanguage();
  const copy = t(language).assessment;
  const { id, assessmentId } = await params;
  const [assessment, report, analysis] = await Promise.all([
    getTeacherAssessmentById(assessmentId),
    getAssessmentReport(assessmentId),
    getAssessmentQuestionAnalysis(assessmentId)
  ]);

  if (!assessment || assessment.classroomId !== id) {
    notFound();
  }

  const summary = summarizeAssessmentReport(report);

  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink"
        href={`/teacher/classes/${id}/assessments`}
      >
        <ArrowLeft className="size-4" />
        {copy.backToAssessments}
      </Link>

      <section className="mt-5 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-violet">
              {assessment.classroomName} · {typeLabel(assessment.type, copy)}
            </p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">{assessment.title}</h1>
            {assessment.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">{assessment.description}</p> : null}
            <p className="mt-3 text-sm font-semibold text-ink/55">
              {assessment.questionCount} {copy.questionCount}
              {assessment.durationMinutes ? ` · ${assessment.durationMinutes} ${copy.minutes}` : ""}
            </p>
          </div>
          {assessment.status === "published" ? (
            <CloseAssessmentButton assessmentId={assessment.id} language={language} />
          ) : (
            <span className="rounded-full bg-ink/5 px-3 py-1.5 text-sm font-bold">{copy.statusClosed}</span>
          )}
        </div>
      </section>

      <div className="mt-6">
        <AssessmentReport analysis={analysis} language={language} rows={report} summary={summary} />
      </div>
    </div>
  );
}
