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

  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink"
        href={`/teacher/classes/${id}`}
      >
        <ArrowLeft className="size-4" />
        {copy.backToClass}
      </Link>

      <div className="mt-4 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
        <p className="text-xs font-bold uppercase text-violet">{assignment.classroomName}</p>
        <h1 className="mt-2 break-words text-2xl font-black sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-ink/60">
          {copy.dueLabel}: {formatDue(assignment.dueAt, language, copy.noDueDate)}
        </p>
        {assignment.instructions ? (
          <p className="mt-3 rounded-md bg-ink/5 px-4 py-3 text-sm leading-6 text-ink/75">
            {assignment.instructions}
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <AssignmentReportTable language={language} rows={report} summary={summary} />
      </div>
    </div>
  );
}
