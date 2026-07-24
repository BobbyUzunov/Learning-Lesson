import Link from "next/link";
import { ArrowRight, BrainCircuit, Code2, Palette, ShieldCheck } from "lucide-react";
import { getSchoolCurriculum, localizeCurriculumText } from "@/lib/curriculum";
import type { CurriculumIcon, CurriculumMission } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

const specialtyIcons: Record<CurriculumIcon, typeof Code2> = {
  code: Code2,
  brain: BrainCircuit,
  palette: Palette,
  shield: ShieldCheck
};

const FEATURED_MISSION_ID = "mission-school-poster";

function findFeaturedMission(missions: CurriculumMission[]) {
  return missions.find((mission) => mission.id === FEATURED_MISSION_ID) ?? missions[0] ?? null;
}

export default async function HomePage() {
  const language = await getLanguage();
  const copy = t(language).home;
  const session = await getCurrentSession();
  const curriculum = await getSchoolCurriculum();
  const featuredMission = findFeaturedMission(curriculum.missions);
  const featuredModule = featuredMission
    ? curriculum.modules.find((module) => module.id === featuredMission.moduleId)
    : null;
  const featuredSpecialty = featuredModule?.specialtyId
    ? curriculum.specialties.find((specialty) => specialty.id === featuredModule.specialtyId)
    : null;

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-paper">
        <span className="pointer-events-none absolute -left-24 top-0 size-[28rem] rounded-full bg-mint/25 blur-3xl" />
        <span className="pointer-events-none absolute -right-16 bottom-0 size-[32rem] rounded-full bg-coral/20 blur-3xl" />
        <span className="pointer-events-none absolute left-1/3 top-1/4 size-[22rem] rounded-full bg-violet/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center px-4 py-14 sm:py-16">
          <div className="animate-home-rise max-w-3xl">
            <p className="font-display text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[0.92] tracking-tight">
              {copy.brand}
            </p>
            <h1 className="mt-6 max-w-2xl font-display text-[clamp(1.65rem,3.6vw,2.6rem)] font-semibold leading-tight text-paper/92">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-paper/60 sm:text-lg sm:leading-8">{copy.subtitle}</p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mint/90"
                href="/paths"
              >
                {copy.primaryCta}
                <ArrowRight className="size-5" />
              </Link>
              {session.user ? (
                <Link className="text-sm font-semibold text-paper/70 underline-offset-4 transition hover:text-paper hover:underline" href="/dashboard">
                  {copy.openDashboard}
                </Link>
              ) : (
                <Link className="text-sm font-semibold text-paper/70 underline-offset-4 transition hover:text-paper hover:underline" href="/login">
                  {copy.hasAccount}
                </Link>
              )}
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

          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {curriculum.specialties.map((specialty, index) => {
              const Icon = specialtyIcons[specialty.icon];
              const style = curriculumAccentStyles[specialty.accent];

              return (
                <li key={specialty.id}>
                  <Link className="group block focus-ring rounded-xl" href="/paths">
                    <span className={`grid size-11 place-items-center rounded-xl ${style.icon}`}>
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 font-mono text-xs font-bold text-ink/35">0{index + 1}</p>
                    <h3 className="mt-2 font-display text-xl font-bold leading-6">
                      {localizeCurriculumText(specialty.title, language)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-ink/55">
                      {localizeCurriculumText(specialty.description, language)}
                    </p>
                    <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold ${style.text}`}>
                      {copy.openProfession}
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {featuredMission ? (
        <section className="bg-white/70">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">{copy.exampleLabel}</p>
            <div className="mt-4 max-w-3xl">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {localizeCurriculumText(featuredMission.title, language)}
              </h2>
              {featuredSpecialty ? (
                <p className="mt-3 text-sm font-bold text-ink/50">
                  {localizeCurriculumText(featuredSpecialty.title, language)}
                  {" · "}
                  {featuredMission.estimatedMinutes} {copy.minutes}
                </p>
              ) : null}
              <p className="mt-4 text-base leading-7 text-ink/65">
                {localizeCurriculumText(featuredMission.brief, language)}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/50">
                <span className="font-bold text-ink/70">{copy.deliverableLabel}: </span>
                {localizeCurriculumText(featuredMission.deliverable, language)}
              </p>
              <Link
                className="focus-ring mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 font-bold text-paper transition hover:bg-ink/90"
                href="/paths"
              >
                {copy.exampleCta}
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
