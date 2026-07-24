"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ExternalLink, GraduationCap, Rocket, Shapes, TimerReset } from "lucide-react";
import { CurriculumDetails } from "@/components/curriculum/curriculum-details";
import { GradeRoadmap } from "@/components/curriculum/grade-roadmap";
import { LearningPathSummary } from "@/components/curriculum/learning-path-summary";
import { SpecialtySelector } from "@/components/curriculum/specialty-selector";
import { StudentMissionCard } from "@/components/curriculum/student-mission-card";
import {
  getCommonModules,
  getCourseIdsForSpecialty,
  getMissionForModule,
  getSpecialtyModules
} from "@/lib/curriculum/helpers";
import type { SchoolCurriculum } from "@/lib/curriculum/types";
import { t, type Language } from "@/lib/i18n";

type SchoolCurriculumExplorerProps = {
  courseLabels: Record<string, string>;
  curriculum: SchoolCurriculum;
  isAuthenticated: boolean;
  language: Language;
};

export function SchoolCurriculumExplorer({
  courseLabels,
  curriculum,
  isAuthenticated,
  language
}: SchoolCurriculumExplorerProps) {
  const copy = t(language).schoolCurriculum;
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(
    curriculum.specialties[0]?.id ?? "software-development"
  );
  const selectedSpecialty =
    curriculum.specialties.find((specialty) => specialty.id === selectedSpecialtyId) ?? curriculum.specialties[0];

  if (!selectedSpecialty) {
    return null;
  }

  const commonModules = getCommonModules(curriculum, 8);
  const specialtyModules = getSpecialtyModules(curriculum, selectedSpecialty.id, 8);
  const mission = specialtyModules.map((module) => getMissionForModule(curriculum, module.id)).find(Boolean) ?? null;
  const relatedCourseIds = getCourseIdsForSpecialty(curriculum, selectedSpecialty.id, 8).filter(
    (courseId) => courseLabels[courseId]
  );

  return (
    <section className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white/85 shadow-soft">
      <div className="relative overflow-hidden bg-ink px-5 py-7 text-paper sm:px-8 sm:py-9 lg:px-10">
        <span className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-violet/30 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full bg-mint/20 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-mint">
              <GraduationCap className="size-4" />
              {copy.studentMode} · {copy.pilotBadge}
            </p>
            <h1 className="mt-5 max-w-4xl text-[2.15rem] font-black leading-[1.04] sm:text-5xl lg:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-paper/65 sm:text-lg">{copy.heroSubtitle}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-black text-ink transition hover:-translate-y-0.5 hover:bg-mint/90" href="#choose-specialty">
                {copy.tryNow}
                <ArrowRight className="size-5" />
              </a>
              <Link className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-black text-paper transition hover:bg-white/10" href={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? copy.openDashboard : copy.createProfile}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
              <Shapes className="size-4 text-coral sm:size-5" />
              <p className="mt-3 text-xl font-black sm:mt-4 sm:text-2xl">4</p>
              <p className="mt-1 text-[10px] font-bold leading-4 text-paper/50 sm:text-xs">{copy.metricProfessions}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
              <TimerReset className="size-4 text-mint sm:size-5" />
              <p className="mt-3 whitespace-nowrap text-xl font-black sm:mt-4 sm:text-2xl">45–60</p>
              <p className="mt-1 text-[10px] font-bold leading-4 text-paper/50 sm:text-xs">{copy.metricMinutes}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
              <Rocket className="size-4 text-violet sm:size-5" />
              <p className="mt-3 text-xl font-black sm:mt-4 sm:text-2xl">1</p>
              <p className="mt-1 text-[10px] font-bold leading-4 text-paper/50 sm:text-xs">{copy.metricResult}</p>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-x-auto sm:block">
          <GradeRoadmap language={language} />
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-8 lg:p-10">
        <div id="choose-specialty" className="scroll-mt-24">
          <SpecialtySelector
            language={language}
            onSelect={setSelectedSpecialtyId}
            selectedId={selectedSpecialty.id}
            specialties={curriculum.specialties}
          />
        </div>

        {mission ? (
          <div aria-live="polite" className="grid gap-5 xl:grid-cols-[1.42fr_0.58fr]" id="selected-curriculum">
            <StudentMissionCard
              firstCourseId={relatedCourseIds[0]}
              language={language}
              mission={mission}
              specialty={selectedSpecialty}
            />
            <LearningPathSummary
              courseIds={relatedCourseIds}
              courseLabels={courseLabels}
              language={language}
              mission={mission}
              specialty={selectedSpecialty}
            />
          </div>
        ) : null}

        <CurriculumDetails commonModules={commonModules} language={language} specialtyModules={specialtyModules} />

        <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-ink/60">{copy.sourceLabel}</p>
          <a className="inline-flex items-center gap-2 text-sm font-black text-violet hover:underline" href="https://pgknma.com/priem/" rel="noreferrer" target="_blank">
            {copy.viewSource}
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
