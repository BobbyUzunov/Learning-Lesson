import Link from "next/link";
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
      <p className="text-sm font-bold uppercase text-coral">{copy.admin.protected}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.admin.reviewsTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.reviewsSubtitle}</p>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white/80">
        {submissions.length === 0 ? (
          <p className="p-6 text-sm font-semibold text-ink/60">{copy.admin.reviewsEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-4 py-3">{copy.admin.reviewLearner}</th>
                <th className="px-4 py-3">{copy.admin.reviewProject}</th>
                <th className="px-4 py-3">{copy.admin.reviewSubmittedAt}</th>
                <th className="px-4 py-3">{copy.admin.reviewAction}</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const projectDef = getProjectById(projects, submission.project_id);
                const project = projectDef ? localizeProject(projectDef, language) : null;

                return (
                  <tr className="border-t border-ink/10" key={submission.id}>
                    <td className="px-4 py-3 font-bold">
                      {submission.learner_name ?? submission.learner_email ?? submission.user_id}
                    </td>
                    <td className="px-4 py-3">{project?.title ?? submission.project_id}</td>
                    <td className="px-4 py-3">
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString(language === "bg" ? "bg-BG" : "en-US")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link className="font-bold text-violet hover:underline" href={`/admin/reviews/${submission.id}`}>
                        {copy.admin.reviewOpen}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </div>
  );
}
