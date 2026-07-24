import Link from "next/link";
import { ClipboardList } from "lucide-react";
import type { AssignmentStatus, ClassroomAssignment } from "@/lib/assignments/types";
import { t, type Language } from "@/lib/i18n";

type UpcomingAssignmentsCardProps = {
  assignments: ClassroomAssignment[];
  language: Language;
};

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

function formatDue(value: string | null | undefined, language: Language, fallback: string) {
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

function missionTitle(assignment: ClassroomAssignment, language: Language) {
  if (language === "bg") {
    return assignment.titleOverride || assignment.missionTitleBg || assignment.missionTitle || assignment.missionId;
  }
  return assignment.titleOverride || assignment.missionTitle || assignment.missionId;
}

export function UpcomingAssignmentsCard({ assignments, language }: UpcomingAssignmentsCardProps) {
  const copy = t(language).classroom;
  const upcoming = assignments
    .filter((item) => item.submissionStatus !== "approved")
    .slice(0, 4);

  return (
    <section className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet">
            <ClipboardList className="size-4" />
            {copy.upcomingTitle}
          </p>
        </div>
        <Link className="text-sm font-bold text-violet hover:underline" href="/classes">
          {copy.viewAllAssignments}
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">{copy.upcomingEmpty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {upcoming.map((assignment) => (
            <li key={assignment.id}>
              <Link
                className="block rounded-md border border-ink/10 px-3 py-3 transition hover:bg-paper/80"
                href={`/assignments/${assignment.id}`}
              >
                <p className="font-bold leading-5">{missionTitle(assignment, language)}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {assignment.classroomName ? `${assignment.classroomName} · ` : ""}
                  {copy.dueLabel}: {formatDue(assignment.dueAt, language, copy.noDueDate)}
                </p>
                <p className="mt-1 text-xs font-bold text-ink/70">
                  {statusLabel(copy, assignment.submissionStatus)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
