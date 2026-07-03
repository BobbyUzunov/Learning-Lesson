import Link from "next/link";
import { getCourseCatalog } from "@/lib/catalog";
import { localizeProject } from "@/lib/projects";
import { getCourseProjects } from "@/lib/projects/store";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const language = await getLanguage();
  const copy = t(language);
  const catalog = await getCourseCatalog();
  const { projects, source } = await getCourseProjects();

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin">
        ← {copy.admin.cmsNav}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.projectsNav}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.admin.projectsTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.projectsSubtitle}</p>
      <p className="mt-3 inline-flex rounded-md bg-ink/5 px-3 py-2 text-xs font-bold uppercase text-ink/60">
        {copy.admin.catalogSource}: {source === "db" ? copy.admin.catalogDb : copy.admin.catalogFallback}
      </p>

      <section className="mt-6 overflow-x-auto rounded-lg border border-ink/10 bg-white/80">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="px-4 py-3">{copy.admin.projectTitle}</th>
              <th className="px-4 py-3">{copy.admin.quest}</th>
              <th className="px-4 py-3">{copy.admin.projectType}</th>
              <th className="px-4 py-3">{copy.admin.projectAfterLesson}</th>
              <th className="px-4 py-3">{copy.admin.editProject}</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const localized = localizeProject(project, language);
              const course = catalog.courses.find((item) => item.id === project.courseId);
              const courseTitle = course ? localizeGameQuest(course, language).title : project.courseId;

              return (
                <tr className="border-t border-ink/10" key={project.id}>
                  <td className="px-4 py-3 font-bold">{localized.title}</td>
                  <td className="px-4 py-3">{courseTitle}</td>
                  <td className="px-4 py-3">{project.type}</td>
                  <td className="px-4 py-3">{project.afterLessonId}</td>
                  <td className="px-4 py-3">
                    <Link className="font-bold text-violet hover:underline" href={`/admin/projects/${project.id}`}>
                      {copy.admin.editProject}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
