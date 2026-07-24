import { GraduationCap } from "lucide-react";
import { JoinClassroomCard } from "@/components/join-classroom-card";
import { getStudentClassrooms } from "@/lib/supabase/classrooms";
import { requireUser } from "@/lib/supabase/auth";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

function formatDate(value: string, language: string) {
  return new Date(value).toLocaleDateString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default async function ClassesPage() {
  const language = await getLanguage();
  const copy = t(language);
  await requireUser();
  const classrooms = await getStudentClassrooms();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div>
        <p className="text-sm font-bold uppercase text-violet">{copy.nav.classes}</p>
        <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.classroom.myClassesTitle}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.classroom.myClassesSubtitle}</p>
      </div>

      <div className="mt-6">
        <JoinClassroomCard language={language} />
      </div>

      <section className="mt-6">
        {classrooms.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-8 text-center">
            <GraduationCap className="mx-auto size-8 text-ink/40" />
            <h2 className="mt-3 text-lg font-black">{copy.classroom.emptyTitle}</h2>
            <p className="mt-2 text-sm text-ink/60">{copy.classroom.emptyBody}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classrooms.map((classroom) => (
              <div className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" key={classroom.id}>
                <h3 className="text-lg font-black">{classroom.name}</h3>
                {classroom.description ? (
                  <p className="mt-1 text-sm text-ink/60">{classroom.description}</p>
                ) : null}
                <p className="mt-3 text-xs font-bold uppercase text-ink/50">
                  {copy.classroom.gradeLabel}: {classroom.gradeLevel}
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  {copy.classroom.joinedOn} {formatDate(classroom.joinedAt, language)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
