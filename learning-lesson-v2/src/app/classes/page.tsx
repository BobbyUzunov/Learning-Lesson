import Link from "next/link";
import { ClipboardCheck, GraduationCap } from "lucide-react";
import { JoinClassroomCard } from "@/components/join-classroom-card";
import type { AssignmentStatus } from "@/lib/assignments/types";
import { isAssessmentExpired, type AssessmentType } from "@/lib/assessments/types";
import { getMyAssignments } from "@/lib/supabase/assignments";
import { getMyAssessments } from "@/lib/supabase/assessments";
import { getStudentClassrooms } from "@/lib/supabase/classrooms";
import { requireUser } from "@/lib/supabase/auth";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

function formatDate(value: string, language: string) {
  return new Date(value).toLocaleDateString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatDue(value: string | null | undefined, language: string, fallback: string) {
  if (!value) {
    return fallback;
  }
  return new Date(value).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function statusLabel(copy: ReturnType<typeof t>["classroom"], status: AssignmentStatus | null | undefined) {
  switch (status) {
    case "submitted":
      return copy.statusSubmitted;
    case "approved":
      return copy.statusApproved;
    case "needs_changes":
      return copy.statusNeedsChanges;
    case "draft":
      return copy.statusDraft;
    default:
      return copy.statusMissing;
  }
}

function assessmentTypeLabel(type: AssessmentType, copy: ReturnType<typeof t>["assessment"]) {
  if (type === "diagnostic") return copy.typeDiagnostic;
  if (type === "summative") return copy.typeSummative;
  return copy.typeFormative;
}

export default async function ClassesPage() {
  const [language] = await Promise.all([getLanguage(), requireUser()]);
  const copy = t(language);
  const [classrooms, assignments, assessments] = await Promise.all([
    getStudentClassrooms(),
    getMyAssignments(),
    getMyAssessments()
  ]);
  const hasClass = classrooms.length > 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.nav.classHub}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {copy.classroom.myClassesTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-ink/60">{copy.classroom.myClassesSubtitle}</p>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold tracking-tight">{copy.classroom.assignmentsTitle}</h2>
        <p className="mt-1 text-sm text-ink/55">{copy.classroom.assignmentsSubtitle}</p>
        {assignments.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-5 text-sm text-ink/55">
            {copy.classroom.noAssignments}
          </p>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
            {assignments.map((assignment, index) => {
              const title =
                language === "bg"
                  ? assignment.titleOverride ||
                    assignment.missionTitleBg ||
                    assignment.missionTitle ||
                    assignment.missionId
                  : assignment.titleOverride || assignment.missionTitle || assignment.missionId;

              return (
                <li
                  className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                    index > 0 ? "border-t border-ink/8" : ""
                  }`}
                  key={assignment.id}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink/85">{title}</p>
                    <p className="mt-0.5 text-xs text-ink/45">
                      {assignment.classroomName ? `${assignment.classroomName} · ` : ""}
                      {copy.classroom.dueLabel}:{" "}
                      {formatDue(assignment.dueAt, language, copy.classroom.noDueDate)}
                      {" · "}
                      {statusLabel(copy.classroom, assignment.submissionStatus)}
                    </p>
                  </div>
                  <Link
                    className="focus-ring inline-flex min-h-10 shrink-0 items-center rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-paper"
                    href={`/assignments/${assignment.id}`}
                  >
                    {copy.classroom.openAssignment}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold tracking-tight">{copy.assessment.studentTitle}</h2>
        <p className="mt-1 text-sm text-ink/55">{copy.assessment.studentSubtitle}</p>
        {assessments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-6 text-center">
            <ClipboardCheck className="mx-auto size-8 text-ink/30" />
            <p className="mt-2 text-sm font-semibold text-ink/50">{copy.assessment.noStudentAssessments}</p>
          </div>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
            {assessments.map((assessment, index) => {
              const expired = isAssessmentExpired(assessment);
              const status = assessment.attempt
                ? copy.assessment.statusSubmitted
                : expired
                  ? assessment.status === "closed"
                    ? copy.assessment.statusClosed
                    : copy.assessment.statusExpired
                  : copy.assessment.statusOpen;

              return (
                <li
                  className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                    index > 0 ? "border-t border-ink/8" : ""
                  }`}
                  key={assessment.id}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink/85">{assessment.title}</p>
                    <p className="mt-0.5 text-xs text-ink/45">
                      {assessmentTypeLabel(assessment.type, copy.assessment)}
                      {assessment.classroomName ? ` · ${assessment.classroomName}` : ""}
                      {" · "}
                      {assessment.questionCount ?? 0} {copy.assessment.questionCount}
                      {" · "}
                      {status}
                      {assessment.attempt ? ` · ${assessment.attempt.percentage}%` : ""}
                    </p>
                  </div>
                  <Link
                    className="focus-ring inline-flex min-h-10 shrink-0 items-center rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-paper"
                    href={`/assessments/${assessment.id}`}
                  >
                    {copy.assessment.openAssessment}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold tracking-tight">{copy.classroom.myClassSection}</h2>
        {classrooms.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-6 text-center">
            <GraduationCap className="mx-auto size-8 text-ink/30" />
            <h3 className="mt-2 font-bold text-ink/70">{copy.classroom.emptyTitle}</h3>
            <p className="mt-1 text-sm text-ink/50">{copy.classroom.emptyBody}</p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {classrooms.map((classroom) => (
              <li className="rounded-2xl border border-ink/10 bg-white/75 p-4" key={classroom.id}>
                <h3 className="font-display text-lg font-bold tracking-tight">{classroom.name}</h3>
                {classroom.description ? (
                  <p className="mt-1 text-sm text-ink/55">{classroom.description}</p>
                ) : null}
                <p className="mt-3 text-xs font-bold text-ink/40">
                  {copy.classroom.gradeLabel}: {classroom.gradeLevel} · {classroom.academicYear}
                </p>
                <p className="mt-1 text-xs text-ink/40">
                  {copy.classroom.joinedOn} {formatDate(classroom.joinedAt, language)}
                  {classroom.status === "archived" ? ` · ${copy.classroom.statusArchived}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className={`mt-8 rounded-2xl border border-ink/10 bg-white/60 open:bg-white/80 ${hasClass ? "" : "open"}`}>
        <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="block text-sm font-bold text-ink/70">{copy.classroom.joinSectionTitle}</span>
          <span className="mt-1 block text-sm text-ink/45">{copy.classroom.joinSectionHint}</span>
        </summary>
        <div className="border-t border-ink/8 px-4 pb-4 pt-3 sm:px-5">
          <JoinClassroomCard language={language} />
        </div>
      </details>
    </main>
  );
}
