import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock } from "lucide-react";
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
  const progressLabel = copy.reviewProgress
    .replace("{approved}", String(summary.approved))
    .replace("{total}", String(summary.studentCount));
  const waitingLabel =
    summary.submitted > 0
      ? copy.waitingReview.replace("{count}", String(summary.submitted))
      : copy.allCaughtUp;
  const progressPercent = summary.studentCount
    ? Math.round((summary.approved / summary.studentCount) * 100)
    : 0;

  return (
    <div className="pb-4">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/50 transition hover:text-ink"
        href={`/teacher/classes/${id}`}
      >
        <ArrowLeft className="size-4" />
        {copy.backToClass}
      </Link>

      <section className="relative mt-4 overflow-hidden rounded-2xl bg-ink text-paper">
        <span className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-mint/25 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-16 -left-10 size-[18rem] rounded-full bg-violet/20 blur-3xl" />
        <div className="relative px-5 py-7 sm:px-7 sm:py-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">
            {assignment.classroomName}
          </p>
          <h1 className="mt-3 max-w-3xl break-words font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold leading-[1.1] tracking-tight">
            {title}
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-paper/60">
            <CalendarClock className="size-4 text-paper/40" />
            {copy.dueLabel}: {formatDue(assignment.dueAt, language, copy.noDueDate)}
          </p>
          {assignment.instructions ? (
            <p className="mt-4 max-w-2xl rounded-xl bg-paper/10 px-4 py-3 text-sm leading-6 text-paper/70">
              {assignment.instructions}
            </p>
          ) : null}
          <div className="mt-6 max-w-md">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-paper/55">
              <span>
                <span className="font-bold text-paper">{progressLabel}</span>
              </span>
              <span>{waitingLabel}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper/10">
              <div
                className="h-full rounded-full bg-mint"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <AssignmentReportTable language={language} rows={report} summary={summary} />
      </div>
    </div>
  );
}
