import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { getProjectById, localizeProject } from "@/lib/projects";
import { getCourseProjects } from "@/lib/projects/store";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getPendingReviewSubmissions } from "@/lib/supabase/project-submissions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const language = await getLanguage();
  const copy = t(language);
  const [{ projects }, submissions] = await Promise.all([getCourseProjects(), getPendingReviewSubmissions()]);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.nav.roleAdmin}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.admin.reviewsTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/60">{copy.admin.reviewsSubtitle}</p>

      {submissions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-8 text-center">
          <Inbox className="mx-auto size-8 text-ink/30" />
          <p className="mt-3 text-sm font-semibold text-ink/50">{copy.admin.reviewsEmpty}</p>
        </div>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
          {submissions.map((submission, index) => {
            const projectDef = getProjectById(projects, submission.project_id);
            const project = projectDef ? localizeProject(projectDef, language) : null;

            return (
              <li
                className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                  index > 0 ? "border-t border-ink/8" : ""
                }`}
                key={submission.id}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink/85">
                    {submission.learner_name ?? submission.learner_email ?? submission.user_id}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/45">
                    {project?.title ?? submission.project_id}
                    {submission.submitted_at
                      ? ` · ${new Date(submission.submitted_at).toLocaleString(
                          language === "bg" ? "bg-BG" : "en-US",
                          { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
                        )}`
                      : ""}
                  </p>
                </div>
                <Link
                  className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-paper"
                  href={`/admin/reviews/${submission.id}`}
                >
                  {copy.admin.reviewOpen}
                  <ArrowRight className="size-4" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
