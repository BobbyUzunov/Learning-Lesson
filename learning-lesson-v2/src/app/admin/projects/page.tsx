import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { getCourseCatalog } from "@/lib/catalog";
import { localizeProject } from "@/lib/projects";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCourseProjects } from "@/lib/projects/store";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const language = await getLanguage();
  const copy = t(language);
  const [catalog, { projects }] = await Promise.all([getCourseCatalog(), getCourseProjects()]);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.nav.roleAdmin}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.admin.projectsTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/60">{copy.admin.projectsSubtitle}</p>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-8 text-center">
          <FolderKanban className="mx-auto size-8 text-ink/30" />
          <p className="mt-3 text-sm font-semibold text-ink/50">{copy.admin.projectsTitle}</p>
        </div>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
          {projects.map((project, index) => {
            const localized = localizeProject(project, language);
            const course = catalog.courses.find((item) => item.id === project.courseId);
            const courseTitle = course ? localizeGameQuest(course, language).title : project.courseId;

            return (
              <li
                className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                  index > 0 ? "border-t border-ink/8" : ""
                }`}
                key={project.id}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink/85">{localized.title}</p>
                  <p className="mt-0.5 text-xs text-ink/45">
                    {courseTitle} · {project.type}
                    {project.afterLessonId ? ` · ${project.afterLessonId}` : ""}
                  </p>
                </div>
                <Link
                  className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-paper"
                  href={`/admin/projects/${project.id}`}
                >
                  {copy.admin.editProject}
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
