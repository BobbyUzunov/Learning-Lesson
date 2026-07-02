import type { CourseProject, ProjectSubmissionRecord } from "@/lib/projects/types";
import { isSubmissionPendingReview } from "@/lib/projects/submissions";
import { t, type Language } from "@/lib/i18n";

export function ProjectSubmissionStatusBadge({
  language,
  project,
  submission
}: {
  language: Language;
  project: CourseProject;
  submission: ProjectSubmissionRecord | null;
}) {
  const copy = t(language);

  if (!submission?.submitted_at) {
    return null;
  }

  if (submission.status === "approved") {
    return (
      <p className="rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">
        {copy.projects.statusApproved}
      </p>
    );
  }

  if (submission.status === "needs_changes") {
    return (
      <div className="space-y-2">
        <p className="rounded-md bg-coral/10 px-4 py-3 text-sm font-bold text-ink">{copy.projects.statusNeedsChanges}</p>
        {submission.review_notes ? (
          <p className="rounded-md bg-ink/5 px-4 py-3 text-sm leading-6 text-ink/75">
            <span className="font-bold">{copy.projects.reviewFeedback}: </span>
            {submission.review_notes}
          </p>
        ) : null}
      </div>
    );
  }

  if (isSubmissionPendingReview(project, submission)) {
    return (
      <p className="rounded-md bg-violet/10 px-4 py-3 text-sm font-bold text-ink">{copy.projects.statusPendingReview}</p>
    );
  }

  return (
    <p className="rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">
      {copy.projects.alreadySubmitted}:{" "}
      {new Date(submission.submitted_at).toLocaleDateString(language === "bg" ? "bg-BG" : "en-US")}
    </p>
  );
}
