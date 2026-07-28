import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";
import type { Assessment, AssessmentType } from "@/lib/assessments/types";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getTeacherAssessments } from "@/lib/supabase/assessments";

export const dynamic = "force-dynamic";

function typeLabel(type: AssessmentType, copy: ReturnType<typeof t>["assessment"]) {
  if (type === "diagnostic") return copy.typeDiagnostic;
  if (type === "summative") return copy.typeSummative;
  return copy.typeFormative;
}

function formatDue(assessment: Assessment, language: string, fallback: string) {
  if (!assessment.dueAt) return fallback;
  return new Date(assessment.dueAt).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function TeacherAssessmentsPage() {
  const language = await getLanguage();
  const copy = t(language).assessment;
  const assessments = await getTeacherAssessments();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-violet">{copy.teacherTitle}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{copy.teacherTitle}</h1>
          <p className="mt-3 max-w-2xl text-ink/65">{copy.teacherSubtitle}</p>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink/20 bg-white/60 p-8 text-center">
          <ClipboardCheck className="mx-auto size-9 text-ink/35" />
          <p className="mt-3 font-bold text-ink/60">{copy.noTeacherAssessments}</p>
          <p className="mt-2 text-sm text-ink/50">{copy.backToClass}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {assessments.map((assessment) => (
            <article className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft" key={assessment.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase text-violet">
                  {typeLabel(assessment.type, copy)} · {assessment.classroomName}
                </p>
                <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold">
                  {assessment.status === "closed" ? copy.statusClosed : copy.statusPublished}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-black">{assessment.title}</h2>
              <p className="mt-2 text-sm text-ink/55">
                {assessment.questionCount ?? 0} {copy.questionCount} · {assessment.submissionCount ?? 0}{" "}
                {copy.submittedCount}
              </p>
              <p className="mt-1 text-xs text-ink/50">
                {copy.dueLabel}: {formatDue(assessment, language, copy.noDueDate)}
              </p>
              <Link
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-bold text-paper"
                href={`/teacher/classes/${assessment.classroomId}/assessments/${assessment.id}`}
              >
                {copy.openAssessment}
                <Plus className="size-4 rotate-45" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
