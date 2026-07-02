import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminSubmissionReviewForm } from "@/components/admin-submission-review-form";
import { getProjectById, localizeProject } from "@/lib/projects";
import { getCourseProjects } from "@/lib/projects/store";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getAdminSubmissionById } from "@/lib/supabase/project-submissions";

export const dynamic = "force-dynamic";

type AdminReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminReviewPage({ params }: AdminReviewPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const [submission, { projects }] = await Promise.all([getAdminSubmissionById(id), getCourseProjects()]);

  if (!submission || submission.status !== "submitted") {
    notFound();
  }

  const projectDef = getProjectById(projects, submission.project_id);
  if (!projectDef) {
    notFound();
  }

  const project = localizeProject(projectDef, language);

  return (
    <div>
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink" href="/admin/reviews">
        <ArrowLeft className="size-4" />
        {copy.admin.reviewsBack}
      </Link>

      <p className="mt-6 text-sm font-bold uppercase text-coral">{copy.admin.reviewsTitle}</p>
      <h1 className="mt-2 text-4xl font-black">{copy.admin.reviewOpen}</h1>

      <AdminSubmissionReviewForm language={language} project={project} submission={submission} />
    </div>
  );
}
