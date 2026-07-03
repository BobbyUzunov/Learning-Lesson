import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProjectEditor } from "@/components/admin-project-editor";
import { getProjectById, localizeProject } from "@/lib/projects";
import { getCourseProjects } from "@/lib/projects/store";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

type AdminProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProjectPage({ params }: AdminProjectPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const { projects } = await getCourseProjects();
  const project = getProjectById(projects, id);

  if (!project) {
    notFound();
  }

  const localized = localizeProject(project, language);

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin/projects">
        ← {copy.admin.projectsNav}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.editProject}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{localized.title}</h1>
      <p className="mt-2 text-sm text-ink/70">
        ID {project.id} · {project.courseId} · {project.type}
      </p>
      <AdminProjectEditor language={language} project={project} />
    </div>
  );
}
