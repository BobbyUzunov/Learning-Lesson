import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { JoinClassroomCard } from "@/components/join-classroom-card";
import type { AssignmentStatus } from "@/lib/assignments/types";
import { getMyAssignments } from "@/lib/supabase/assignments";
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

export default async function ClassesPage() {
  const language = await getLanguage();
  const copy = t(language);
  await requireUser();
  const [classrooms, assignments] = await Promise.all([getStudentClassrooms(), getMyAssignments()]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div>
        <p className="text-sm font-bold uppercase text-violet">{copy.nav.classes}</p>
        <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.classroom.myClassesTitle}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.classroom.myClassesSubtitle}</p>
      </div>

      <div className="mt-6">
        <JoinClassroomCard language={language} />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-black">{copy.classroom.assignmentsTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{copy.classroom.assignmentsSubtitle}</p>
        {assignments.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-ink/20 bg-white/60 p-6 text-sm text-ink/60">
            {copy.classroom.noAssignments}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {assignments.map((assignment) => {
              const title =
                language === "bg"
                  ? assignment.titleOverride ||
                    assignment.missionTitleBg ||
                    assignment.missionTitle ||
                    assignment.missionId
                  : assignment.titleOverride || assignment.missionTitle || assignment.missionId;

              return (
                <li className="rounded-lg border border-ink/10 bg-white/80 p-4 shadow-soft" key={assignment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="mt-1 text-xs text-ink/55">
                        {assignment.classroomName ? `${assignment.classroomName} · ` : ""}
                        {copy.classroom.dueLabel}:{" "}
                        {formatDue(assignment.dueAt, language, copy.classroom.noDueDate)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-ink/70">
                        {statusLabel(copy.classroom, assignment.submissionStatus)}
                      </p>
                    </div>
                    <Link
                      className="inline-flex min-h-10 items-center rounded-md bg-ink px-3 py-2 text-sm font-bold text-paper"
                      href={`/assignments/${assignment.id}`}
                    >
                      {copy.classroom.openAssignment}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        {classrooms.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-8 text-center">
            <GraduationCap className="mx-auto size-8 text-ink/40" />
            <h2 className="mt-3 text-lg font-black">{copy.classroom.emptyTitle}</h2>
            <p className="mt-2 text-sm text-ink/60">{copy.classroom.emptyBody}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classrooms.map((classroom) => (
              <div className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" key={classroom.id}>
                <h3 className="text-lg font-black">{classroom.name}</h3>
                {classroom.description ? (
                  <p className="mt-1 text-sm text-ink/60">{classroom.description}</p>
                ) : null}
                <p className="mt-3 text-xs font-bold uppercase text-ink/50">
                  {copy.classroom.gradeLabel}: {classroom.gradeLevel} · {classroom.academicYear}
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  {copy.classroom.joinedOn} {formatDate(classroom.joinedAt, language)}
                  {classroom.status === "archived" ? ` · ${copy.classroom.statusArchived}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
