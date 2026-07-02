import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCourseEditor } from "@/components/admin-course-editor";
import { getQuestFromCatalog } from "@/lib/catalog/helpers";
import { getCourseCatalog } from "@/lib/catalog";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

type AdminCoursePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCoursePage({ params }: AdminCoursePageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const catalog = await getCourseCatalog();
  const course = getQuestFromCatalog(catalog, id);

  if (!course) {
    notFound();
  }

  const localizedCourse = localizeGameQuest(course, language);

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin">
        ← {copy.admin.courses}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.editCourse}</p>
      <h1 className="mt-2 text-4xl font-black">{localizedCourse.title}</h1>
      <p className="mt-2 text-sm text-ink/70">
        ID {course.id} · {course.lessonIds.length} {copy.admin.lessons}
      </p>
      <AdminCourseEditor course={course} language={language} />
    </div>
  );
}
