import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck, Plus } from "lucide-react";
import type { AssessmentType } from "@/lib/assessments/types";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getClassroomAssessments } from "@/lib/supabase/assessments";
import { getClassroomById } from "@/lib/supabase/classrooms";

export const dynamic = "force-dynamic";

function typeLabel(type: AssessmentType, copy: ReturnType<typeof t>["assessment"]) {
  if (type === "diagnostic") return copy.typeDiagnostic;
  if (type === "summative") return copy.typeSummative;
  return copy.typeFormative;
}

export default async function ClassroomAssessmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language).assessment;
  const { id } = await params;
  const [classroom, assessments] = await Promise.all([
    getClassroomById(id),
    getClassroomAssessments(id)
  ]);

  if (!classroom) {
    notFound();
  }

  return (
    <div>
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink" href={`/teacher/classes/${id}`}>
        <ArrowLeft className="size-4" />
        {copy.backToClass}
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-violet">{classroom.name}</p>
          <h1 className="mt-2 text-3xl font-black">{copy.teacherTitle}</h1>
          <p className="mt-2 max-w-2xl text-ink/65">{copy.teacherSubtitle}</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-4 py-2 font-bold text-paper"
          href={`/teacher/classes/${id}/assessments/new`}
        >
          <Plus className="size-5" />
          {copy.createAssessment}
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink/20 bg-white/60 p-8 text-center">
          <ClipboardCheck className="mx-auto size-9 text-ink/35" />
          <p className="mt-3 font-bold text-ink/60">{copy.noTeacherAssessments}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {assessments.map((assessment) => (
            <article className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft" key={assessment.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-violet">{typeLabel(assessment.type, copy)}</p>
                  <h2 className="mt-2 text-lg font-black">{assessment.title}</h2>
                  <p className="mt-2 text-sm text-ink/55">
                    {assessment.questionCount ?? 0} {copy.questionCount} · {assessment.submissionCount ?? 0}{" "}
                    {copy.submittedCount}
                  </p>
                </div>
                <Link
                  className="inline-flex min-h-10 items-center rounded-lg border border-ink/15 px-4 py-2 text-sm font-bold"
                  href={`/teacher/classes/${id}/assessments/${assessment.id}`}
                >
                  {copy.openAssessment}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
