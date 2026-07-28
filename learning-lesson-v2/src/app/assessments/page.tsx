import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { isAssessmentExpired, type AssessmentType } from "@/lib/assessments/types";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getMyAssessments } from "@/lib/supabase/assessments";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

function typeLabel(type: AssessmentType, copy: ReturnType<typeof t>["assessment"]) {
  if (type === "diagnostic") return copy.typeDiagnostic;
  if (type === "summative") return copy.typeSummative;
  return copy.typeFormative;
}

export default async function AssessmentsPage() {
  const language = await getLanguage();
  const copy = t(language).assessment;
  await requireUser();
  const assessments = await getMyAssessments();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <p className="text-sm font-bold uppercase text-violet">{copy.studentTitle}</p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">{copy.studentTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/65">{copy.studentSubtitle}</p>

      {assessments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink/20 bg-white/60 p-8 text-center">
          <ClipboardCheck className="mx-auto size-9 text-ink/35" />
          <p className="mt-3 font-bold text-ink/60">{copy.noStudentAssessments}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {assessments.map((assessment) => {
            const expired = isAssessmentExpired(assessment);
            const status = assessment.attempt
              ? copy.statusSubmitted
              : expired
                ? assessment.status === "closed"
                  ? copy.statusClosed
                  : copy.statusExpired
                : copy.statusOpen;

            return (
              <article className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft" key={assessment.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-violet">
                      {typeLabel(assessment.type, copy)} · {assessment.classroomName}
                    </p>
                    <h2 className="mt-2 text-lg font-black">{assessment.title}</h2>
                    <p className="mt-2 text-sm font-semibold text-ink/55">
                      {assessment.questionCount ?? 0} {copy.questionCount} · {status}
                    </p>
                    {assessment.attempt ? (
                      <p className="mt-2 text-xl font-black text-[#168864]">{assessment.attempt.percentage}%</p>
                    ) : null}
                  </div>
                  <Link
                    className="inline-flex min-h-10 items-center rounded-lg bg-ink px-4 py-2 text-sm font-bold text-paper"
                    href={`/assessments/${assessment.id}`}
                  >
                    {copy.openAssessment}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
