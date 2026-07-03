import Link from "next/link";
import { AlertCircle, Clock3 } from "lucide-react";
import { getSubmissionForProject, isCapstoneProject } from "@/lib/projects/submissions";
import { localizeProject } from "@/lib/projects/helpers";
import type { CourseProject, ProjectSubmissionRecord } from "@/lib/projects/types";
import { t, type Language } from "@/lib/i18n";

export function CapstoneReviewBanner({
  language,
  projects,
  submissions
}: {
  language: Language;
  projects: CourseProject[];
  submissions: ProjectSubmissionRecord[];
}) {
  const copy = t(language);
  const capstone = projects.find(isCapstoneProject);
  if (!capstone) {
    return null;
  }

  const submission = getSubmissionForProject(submissions, capstone.id);
  if (!submission?.submitted_at) {
    return null;
  }

  const localized = localizeProject(capstone, language);

  if (submission.status === "submitted") {
    return (
      <section className="rounded-lg border border-violet/25 bg-violet/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-violet">
              <Clock3 className="size-4" />
              {copy.dashboard.capstoneReviewTitle}
            </p>
            <h3 className="mt-2 text-2xl font-black">{localized.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{copy.dashboard.capstoneReviewBody}</p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-3 text-center font-bold text-ink"
            href={`/projects/${capstone.id}`}
          >
            {copy.dashboard.openCapstone}
          </Link>
        </div>
      </section>
    );
  }

  if (submission.status === "needs_changes") {
    return (
      <section className="rounded-lg border border-coral/25 bg-coral/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-coral">
              <AlertCircle className="size-4" />
              {copy.dashboard.capstoneNeedsChangesTitle}
            </p>
            <h3 className="mt-2 text-2xl font-black">{localized.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{copy.dashboard.capstoneNeedsChangesBody}</p>
            {submission.review_notes ? (
              <p className="mt-3 rounded-md bg-white/80 px-4 py-3 text-sm leading-6 text-ink/75">
                <span className="font-bold">{copy.projects.reviewFeedback}: </span>
                {submission.review_notes}
              </p>
            ) : null}
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md bg-coral px-5 py-3 text-center font-black text-paper"
            href={`/projects/${capstone.id}`}
          >
            {copy.dashboard.openCapstone}
          </Link>
        </div>
      </section>
    );
  }

  return null;
}
