import Link from "next/link";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { CreateClassroomForm } from "@/components/teacher/create-classroom-form";
import { CopyCodeButton } from "@/components/teacher/copy-code-button";
import { getSchoolCurriculum, localizeCurriculumText } from "@/lib/curriculum";
import { getTeacherClassrooms } from "@/lib/supabase/classrooms";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const language = await getLanguage();
  const copy = t(language);
  const [classrooms, curriculum] = await Promise.all([getTeacherClassrooms(), getSchoolCurriculum()]);
  const specialties = curriculum.specialties.map((specialty) => ({
    id: specialty.id,
    title: localizeCurriculumText(specialty.title, language)
  }));

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase text-violet">{copy.nav.teacher}</p>
        <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.teacher.panelTitle}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.teacher.panelSubtitle}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <CreateClassroomForm language={language} specialties={specialties} />

        <section>
          {classrooms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-8 text-center">
              <GraduationCap className="mx-auto size-8 text-ink/40" />
              <h2 className="mt-3 text-lg font-black">{copy.teacher.emptyTitle}</h2>
              <p className="mt-2 text-sm text-ink/60">{copy.teacher.emptyBody}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {classrooms.map((classroom) => (
                <div className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" key={classroom.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">{classroom.name}</h3>
                      {classroom.description ? (
                        <p className="mt-1 text-sm text-ink/60">{classroom.description}</p>
                      ) : null}
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-ink/70">
                        <Users className="size-4" />
                        {classroom.memberCount ?? 0} {copy.teacher.studentsCount}
                      </p>
                      <p className="mt-2 text-xs text-ink/55">
                        {classroom.academicYear} · {copy.teacher.gradeLabel} {classroom.gradeLevel} ·{" "}
                        {classroom.status === "archived"
                          ? copy.teacher.statusArchived
                          : copy.teacher.statusActive}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-ink/50">{copy.teacher.joinCodeLabel}</p>
                      <p className="font-mono text-2xl font-black tracking-[0.2em] text-violet">{classroom.joinCode}</p>
                      {!classroom.joinCodeEnabled ? (
                        <p className="mt-1 text-xs font-bold text-coral">{copy.teacher.joinCodeDisabled}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <CopyCodeButton code={classroom.joinCode} language={language} />
                    <Link
                      className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper transition hover:bg-ink/90"
                      href={`/teacher/classes/${classroom.id}`}
                    >
                      {copy.teacher.openClass}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
