import Link from "next/link";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { CreateClassroomForm } from "@/components/teacher/create-classroom-form";
import { CopyCodeButton } from "@/components/teacher/copy-code-button";
import { getSchoolCurriculum, localizeCurriculumText } from "@/lib/curriculum";
import { getTeacherClassrooms } from "@/lib/supabase/classrooms";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage({
  searchParams
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const language = await getLanguage();
  const copy = t(language);
  const [{ create }, classrooms, curriculum] = await Promise.all([
    searchParams,
    getTeacherClassrooms(),
    getSchoolCurriculum()
  ]);
  const specialties = curriculum.specialties.map((specialty) => ({
    id: specialty.id,
    title: localizeCurriculumText(specialty.title, language)
  }));
  const forceCreate = classrooms.length === 0 || create === "1";

  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">{copy.nav.roleTeacher}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.teacher.panelTitle}</h1>
        <p className="mt-2 text-base leading-7 text-ink/60">{copy.teacher.panelSubtitleFast}</p>
      </div>

      <div className="mt-6">
        <CreateClassroomForm defaultOpen={forceCreate} language={language} specialties={specialties} />
      </div>

      <section className="mt-6">
        {classrooms.length === 0 ? (
          forceCreate ? null : (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-10 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink/5">
                <GraduationCap className="size-6 text-ink/40" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">{copy.teacher.emptyTitle}</h2>
              <p className="mt-2 text-sm text-ink/55">{copy.teacher.emptyBody}</p>
            </div>
          )
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
            {classrooms.map((classroom, index) => (
              <li className={index > 0 ? "border-t border-ink/8" : undefined} key={classroom.id}>
                <div className="px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-bold tracking-tight">{classroom.name}</h2>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ink/65">
                        <Users className="size-4 text-ink/40" />
                        {classroom.memberCount ?? 0} {copy.teacher.studentsCount}
                      </p>
                      <p className="mt-1 text-xs text-ink/45">
                        {classroom.academicYear} · {copy.teacher.gradeLabel} {classroom.gradeLevel} ·{" "}
                        {classroom.status === "archived"
                          ? copy.teacher.statusArchived
                          : copy.teacher.statusActive}
                      </p>
                    </div>
                    <div className="rounded-xl bg-ink/[0.03] px-4 py-3 text-left sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40">
                        {copy.teacher.joinCodeLabel}
                      </p>
                      <p className="mt-1 font-mono text-xl font-black tracking-[0.2em] text-violet">
                        {classroom.joinCode}
                      </p>
                      {!classroom.joinCodeEnabled ? (
                        <p className="mt-1 text-xs font-bold text-coral">{copy.teacher.joinCodeDisabled}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <CopyCodeButton code={classroom.joinCode} language={language} />
                    <Link
                      className="focus-ring inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90"
                      href={`/teacher/classes/${classroom.id}`}
                    >
                      {copy.teacher.openClass}
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      className="focus-ring inline-flex items-center rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm font-bold text-ink/70 transition hover:border-ink/25 hover:text-ink"
                      href={`/teacher/classes/${classroom.id}/assessments/new`}
                    >
                      {copy.assessment.createAssessment}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
