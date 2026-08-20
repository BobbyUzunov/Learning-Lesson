import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SubmitAssignmentForm } from "@/components/submit-assignment-form";
import { E2E_ASSIGNMENT_ID, e2eStudentAssignment } from "@/lib/assignments/e2e-fixture";
import { getAssignmentById, getMySubmissionForAssignment } from "@/lib/supabase/assignments";
import { requireUser } from "@/lib/supabase/auth";
import { getE2eAuthState } from "@/lib/supabase/e2e-auth";
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

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language).classroom;
  const session = await requireUser();
  const { id } = await params;
  const e2e = await getE2eAuthState();

  const [loadedAssignment, submission] = await Promise.all([
    getAssignmentById(id),
    getMySubmissionForAssignment(id)
  ]);
  const assignment =
    loadedAssignment ?? (e2e?.role === "user" && id === E2E_ASSIGNMENT_ID ? e2eStudentAssignment() : null);

  if (!assignment) {
    notFound();
  }

  const title =
    language === "bg"
      ? assignment.titleOverride || assignment.missionTitleBg || assignment.missionTitle || assignment.missionId
      : assignment.titleOverride || assignment.missionTitle || assignment.missionId;
  const brief =
    language === "bg" ? assignment.missionBriefBg || assignment.missionBrief : assignment.missionBrief;
  const deliverable =
    language === "bg"
      ? assignment.missionDeliverableBg || assignment.missionDeliverable
      : assignment.missionDeliverable;

  const status = submission?.status ?? "missing";

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink" href="/classes">
        <ArrowLeft className="size-4" />
        {copy.backToClasses}
      </Link>

      <div className="mt-4 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
        {assignment.classroomName ? (
          <p className="text-xs font-bold uppercase text-violet">
            {copy.classroomLabel}: {assignment.classroomName}
          </p>
        ) : null}
        <h1 className="mt-2 break-words text-3xl font-black">{title}</h1>
        <p className="mt-2 text-sm text-ink/60">
          {copy.dueLabel}: {formatDue(assignment.dueAt, language, copy.noDueDate)}
        </p>
        {brief ? (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-ink/45">{copy.missionBrief}</p>
            <p className="mt-2 text-base leading-7 text-ink/75">{brief}</p>
          </div>
        ) : null}
        {deliverable ? (
          <div className="mt-4 rounded-md bg-ink px-4 py-3 text-paper">
            <p className="text-xs font-bold uppercase text-mint">{copy.expectedDeliverable}</p>
            <p className="mt-2 text-sm leading-6">{deliverable}</p>
          </div>
        ) : null}
        {assignment.instructions ? (
          <p className="mt-4 rounded-md bg-ink/5 px-4 py-3 text-sm leading-6 text-ink/75">
            {assignment.instructions}
          </p>
        ) : null}
        <Link
          className="mt-4 inline-flex items-center gap-2 text-sm font-black text-violet hover:underline"
          href={`/missions/${assignment.missionId}`}
        >
          {copy.openMissionGuide}
        </Link>
      </div>

      <div className="mt-6">
        <SubmitAssignmentForm
          assignmentId={assignment.id}
          initialText={submission?.deliverableText}
          initialUrl={submission?.deliverableUrl}
          language={language}
          showMentor={!session.isTeacher}
          status={status}
          teacherNote={submission?.teacherNote}
        />
      </div>
    </main>
  );
}
