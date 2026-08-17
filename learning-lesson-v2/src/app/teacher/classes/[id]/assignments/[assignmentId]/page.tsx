import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssignmentReportTable } from "@/components/teacher/assignment-report-table";
import { summarizeAssignmentReport } from "@/lib/assignments/types";
import { getAssignmentById, getAssignmentReport } from "@/lib/supabase/assignments";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

function formatDue(value: string | null, language: string, fallback: string) {
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

export default async function TeacherAssignmentPage({
  params
}: {
  params: Promise<{ id: string; assignmentId: string }>;
}) {
  const language = await getLanguage();
  const copy = t(language).teacher;
  const { id, assignmentId } = await params;

  const assignment = await getAssignmentById(assignmentId);
  if (!assignment || assignment.classroomId !== id) {
    notFound();
  }

  const report = await getAssignmentReport(assignmentId);
  const summary = summarizeAssignmentReport(report);
  const title =
    language === "bg"
      ? assignment.titleOverride || assignment.missionTitleBg || assignment.missionTitle || assignment.missionId
      : assignment.titleOverride || assignment.missionTitle || assignment.missionId;
  const statusLine =
    summary.submitted > 0
      ? copy.waitingReview.replace("{count}", String(summary.submitted))
      : copy.reviewProgress.replace("{approved}", String(summary.approved)).replace("{total}", String(summary.studentCount));

  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/50 transition hover:text-ink"
        href={`/teacher/classes/${id}`}
      >
        <ArrowLeft className="size-4" />
        {copy.backToClass}
      </Link>

      <header className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">{assignment.classroomName}</p>
        <h1 className="mt-2 max-w-3xl break-words font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          {copy.dueLabel}: {formatDue(assignment.dueAt, language, copy.noDueDate)}
          <span className="px-2 text-ink/25">·</span>
          {statusLine}
        </p>
        {assignment.instructions ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">{assignment.instructions}</p>
        ) : null}
      </header>

      <div className="mt-8">
        <AssignmentReportTable language={language} rows={report} summary={summary} />
      </div>
    </div>
  );
}
