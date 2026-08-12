import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import type { Assessment, AssessmentType } from "@/lib/assessments/types";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getTeacherAssessments } from "@/lib/supabase/assessments";
import { getTeacherClassrooms } from "@/lib/supabase/classrooms";

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
  const full = t(language);
  const copy = full.assessment;
  const teacherCopy = full.teacher;
  const [assessments, classrooms] = await Promise.all([getTeacherAssessments(), getTeacherClassrooms()]);
  const activeClassrooms = classrooms.filter((classroom) => classroom.status === "active");
  const createHref =
    activeClassrooms.length === 1
      ? `/teacher/classes/${activeClassrooms[0].id}/assessments/new`
      : activeClassrooms.length > 1
        ? "/teacher/classes"
        : "/teacher/classes?create=1";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">{full.nav.roleTeacher}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.teacherTitle}</h1>
          <p className="mt-2 text-base leading-7 text-ink/60">{copy.teacherSubtitle}</p>
        </div>
        <Link
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:-translate-y-0.5 hover:bg-ink/90"
          href={createHref}
        >
          {copy.createAssessment}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink/5">
            <ClipboardCheck className="size-6 text-ink/35" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-ink/70">{copy.noTeacherAssessments}</p>
          <p className="mt-2 text-sm text-ink/50">
            {activeClassrooms.length === 0 ? teacherCopy.emptyBody : copy.createFromClassHint}
          </p>
          <Link
            className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-mint/90"
            href={createHref}
          >
            {activeClassrooms.length === 0 ? teacherCopy.createButton : copy.createAssessment}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
          {assessments.map((assessment, index) => (
            <li className={index > 0 ? "border-t border-ink/8" : undefined} key={assessment.id}>
              <Link
                className="group flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-mint/[0.06]"
                href={`/teacher/classes/${assessment.classroomId}/assessments/${assessment.id}`}
              >
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">
                    {typeLabel(assessment.type, copy)} · {assessment.classroomName}
                  </span>
                  <span className="mt-1 block font-display text-lg font-bold tracking-tight">{assessment.title}</span>
                  <span className="mt-1 block text-sm text-ink/50">
                    {assessment.questionCount ?? 0} {copy.questionCount} · {assessment.submissionCount ?? 0}{" "}
                    {copy.submittedCount} · {copy.dueLabel}:{" "}
                    {formatDue(assessment, language, copy.noDueDate)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-ink/65">
                  <span className="rounded-lg bg-ink/[0.04] px-2.5 py-1 text-xs">
                    {assessment.status === "closed" ? copy.statusClosed : copy.statusPublished}
                  </span>
                  <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/70" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
