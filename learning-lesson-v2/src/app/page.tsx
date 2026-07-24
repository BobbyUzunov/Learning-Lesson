import Link from "next/link";
import { ArrowRight, BrainCircuit, Code2, Flag, Palette, ShieldCheck, Users } from "lucide-react";
import { ContinueLearningButton } from "@/components/continue-learning-button";
import { getCourseCatalog } from "@/lib/catalog";
import { getSchoolCurriculum, localizeCurriculumText } from "@/lib/curriculum";
import type { CurriculumIcon } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export const dynamic = "force-dynamic";

const specialtyIcons: Record<CurriculumIcon, typeof Code2> = {
  code: Code2,
  brain: BrainCircuit,
  palette: Palette,
  shield: ShieldCheck
};

export default async function HomePage() {
  const language = await getLanguage();
  const copy = t(language).home;
  const session = await getCurrentSession();
  const [catalog, curriculum] = await Promise.all([getCourseCatalog(), getSchoolCurriculum()]);
  const progressData = session.user ? await getCurrentUserProgress() : null;
  const firstLessonId = catalog.courses[0]?.lessonIds[0] ?? "1";
  const visualHint = copy.visualHint
    .replace("{missions}", String(curriculum.missions.length))
    .replace("{professions}", String(curriculum.specialties.length));

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-paper">
        <span className="pointer-events-none absolute -left-24 top-0 size-[28rem] rounded-full bg-mint/25 blur-3xl" />
        <span className="pointer-events-none absolute -right-16 bottom-0 size-[32rem] rounded-full bg-coral/20 blur-3xl" />
        <span className="pointer-events-none absolute left-1/3 top-1/4 size-[22rem] rounded-full bg-violet/20 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-end gap-10 px-4 pb-12 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-16 lg:pt-14">
          <div className="animate-home-rise">
            <p className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[0.92] tracking-tight">
              {copy.brand}
            </p>
            <h1 className="mt-5 max-w-xl font-display text-[clamp(1.55rem,3.4vw,2.35rem)] font-semibold leading-tight text-paper/92">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-paper/60 sm:text-lg sm:leading-8">{copy.subtitle}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mint/90"
                href="/paths"
              >
                {copy.primaryCta}
                <ArrowRight className="size-5" />
              </Link>
              {session.user ? (
                <ContinueLearningButton
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-paper transition hover:bg-white/10"
                  completedLessonIds={progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id)}
                  courses={catalog.courses}
                  label={copy.continueLearning}
                />
              ) : (
                <Link
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-paper transition hover:bg-white/10"
                  href={`/lesson/${firstLessonId}`}
                >
                  {copy.tryLesson}
                </Link>
              )}
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-mint/80">{copy.pilot}</p>
          </div>

          <div
            aria-hidden="true"
            className="animate-home-fade relative -mx-4 min-h-[22rem] overflow-hidden border-t border-white/10 lg:mx-0 lg:min-h-[28rem] lg:border-l lg:border-t-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(47,191,143,0.28),transparent_46%),radial-gradient(circle_at_82%_72%,rgba(242,109,91,0.22),transparent_42%),linear-gradient(160deg,rgba(255,255,255,0.06),transparent_55%)]" />
            <div className="relative flex h-full flex-col justify-between gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:pl-10 lg:pr-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-paper/45">{copy.visualLabel}</p>
                <p className="mt-3 font-display text-3xl font-bold leading-none sm:text-4xl">{visualHint}</p>
              </div>
              <ul className="space-y-3">
                {curriculum.specialties.map((specialty, index) => (
                  <li className="flex items-center gap-3 border-t border-white/10 pt-3 first:border-t-0 first:pt-0" key={specialty.id}>
                    <span className="font-mono text-xs font-bold text-paper/35">0{index + 1}</span>
                    <span className="font-display text-lg font-semibold leading-tight sm:text-xl">
                      {localizeCurriculumText(specialty.title, language)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-paper/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.professionsTitle}</h2>
            <p className="mt-3 text-base leading-7 text-ink/60">{copy.professionsSubtitle}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {curriculum.specialties.map((specialty) => {
              const Icon = specialtyIcons[specialty.icon];
              const style = curriculumAccentStyles[specialty.accent];

              return (
                <Link
                  className={`focus-ring group relative overflow-hidden rounded-2xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-soft ${style.border}`}
                  href="/paths"
                  key={specialty.id}
                >
                  <span className={`absolute -right-10 -top-10 size-28 rounded-full blur-2xl ${style.glow}`} />
                  <span className={`relative grid size-11 place-items-center rounded-xl ${style.icon}`}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className="relative mt-5 font-display text-xl font-bold leading-6">
                    {localizeCurriculumText(specialty.title, language)}
                  </h3>
                  <p className="relative mt-2 text-sm leading-6 text-ink/55">
                    {localizeCurriculumText(specialty.description, language)}
                  </p>
                  <span className={`relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${style.text}`}>
                    {copy.openProfession}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.howTitle}</h2>
            <p className="mt-3 text-base leading-7 text-ink/60">{copy.howSubtitle}</p>
          </div>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {copy.howSteps.map((step, index) => (
              <li key={step.title}>
                <p className="font-mono text-sm font-bold text-ink/35">0{index + 1}</p>
                <h3 className="mt-3 font-display text-2xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-14">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-mint">
              <Users className="size-4" />
              {copy.pilot}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.teachersTitle}</h2>
            <p className="mt-3 text-base leading-7 text-paper/60">{copy.teachersText}</p>
            <p className="mt-2 text-sm text-paper/40">{copy.teachersHint}</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-paper/55">
              <Flag className="size-4 text-mint" />
              {visualHint}
            </p>
            {session.isTeacher ? (
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:bg-mint/90"
                href="/teacher"
              >
                {copy.teachersCta}
                <ArrowRight className="size-5" />
              </Link>
            ) : (
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:bg-mint/90"
                href="/paths"
              >
                {copy.browsePaths}
                <ArrowRight className="size-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
