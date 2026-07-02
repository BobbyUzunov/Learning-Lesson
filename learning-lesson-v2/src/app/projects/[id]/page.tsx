import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Rocket } from "lucide-react";
import { ProjectSubmissionForm } from "@/components/project-submission-form";
import { getProjectById, isProjectUnlocked, localizeProject } from "@/lib/projects";
import { getCourseProjects } from "@/lib/projects/store";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { getCurrentUserProjectSubmissions } from "@/lib/supabase/project-submissions";
import { getCourseCatalog, getQuestFromCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const { projects } = await getCourseProjects();
  const projectDef = getProjectById(projects, id);

  if (!projectDef) {
    notFound();
  }

  const session = await getCurrentSession();
  const catalog = await getCourseCatalog();
  const project = localizeProject(projectDef, language);
  const course = getQuestFromCatalog(catalog, project.courseId);
  const localizedCourse = course ? localizeGameQuest(course, language) : null;

  if (!session.user) {
    redirect(`/login?redirect=${encodeURIComponent(`/projects/${id}`)}`);
  }

  const [{ progress }, submissions] = await Promise.all([getCurrentUserProgress(), getCurrentUserProjectSubmissions()]);
  const completedLessonIds = progress.filter((item) => item.completed).map((item) => item.lesson_id);
  const unlocked = isProjectUnlocked(projectDef, completedLessonIds);

  if (!unlocked) {
    redirect("/paths?lessonLocked=1");
  }

  const existingSubmission = submissions.find((item) => item.project_id === project.id) ?? null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink" href="/paths">
        <ArrowLeft className="size-4" />
        {copy.common.backToPaths}
      </Link>

      <article className="mt-6 rounded-lg border border-ink/10 bg-white/85 p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-violet/15 p-3 text-violet">
            <Rocket className="size-6" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase text-violet">
              {copy.projects.badge} · {localizedCourse?.title ?? project.courseId}
            </p>
            <h1 className="mt-2 text-4xl font-black">{project.title}</h1>
            <p className="mt-3 leading-7 text-ink/75">{project.description}</p>
          </div>
        </div>

        {project.requiredForCertificate ? (
          <p className="mt-4 rounded-md bg-coral/10 px-4 py-3 text-sm font-semibold text-ink">
            {copy.projects.requiredForCertificate}
          </p>
        ) : null}

        {existingSubmission?.submitted_at ? (
          <p className="mt-4 rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">
            {copy.projects.alreadySubmitted}: {new Date(existingSubmission.submitted_at).toLocaleDateString(language === "bg" ? "bg-BG" : "en-US")}
          </p>
        ) : null}

        <ProjectSubmissionForm existingSubmission={existingSubmission} language={language} project={project} />
      </article>
    </main>
  );
}
