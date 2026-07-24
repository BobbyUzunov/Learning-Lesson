"use client";

import { BrainCircuit, Code2, Palette, ShieldCheck } from "lucide-react";
import { localizeCurriculumText } from "@/lib/curriculum/helpers";
import type { CurriculumIcon, SchoolSpecialty } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { t, type Language } from "@/lib/i18n";

const specialtyIcons: Record<CurriculumIcon, typeof Code2> = {
  code: Code2,
  brain: BrainCircuit,
  palette: Palette,
  shield: ShieldCheck
};

type SpecialtySelectorProps = {
  language: Language;
  onSelect: (specialtyId: string) => void;
  selectedId: string;
  specialties: SchoolSpecialty[];
};

export function SpecialtySelector({ language, onSelect, selectedId, specialties }: SpecialtySelectorProps) {
  const copy = t(language).schoolCurriculum;

  return (
    <fieldset>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet">01 · {copy.chooseSpecialty}</p>
          <legend className="mt-2 text-2xl font-black sm:text-3xl">{copy.choosePrompt}</legend>
        </div>
        <p className="max-w-md text-sm leading-6 text-ink/55">{copy.chooseHint}</p>
      </div>

      <div className="mt-5 grid auto-cols-[84%] grid-flow-col gap-3 overflow-x-auto pb-3 sm:auto-cols-[47%] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {specialties.map((specialty, index) => {
          const Icon = specialtyIcons[specialty.icon];
          const selected = specialty.id === selectedId;
          const style = curriculumAccentStyles[specialty.accent];

          return (
            <button
              aria-controls="selected-curriculum"
              aria-pressed={selected}
              className={`focus-ring group relative min-h-48 snap-start overflow-hidden rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-soft ${
                selected ? `${style.border} ${style.soft} shadow-sm` : "border-ink/10 bg-white hover:border-ink/25"
              }`}
              key={specialty.id}
              onClick={() => onSelect(specialty.id)}
              type="button"
            >
              <span className={`absolute -right-8 -top-8 size-28 rounded-full blur-2xl ${style.glow}`} />
              <span className="relative flex items-start justify-between gap-4">
                <span className={`grid size-11 place-items-center rounded-xl shadow-sm ${style.icon}`}>
                  <Icon className="size-5" />
                </span>
                <span className="font-mono text-xs font-black text-ink/35">0{index + 1}</span>
              </span>
              <span className="relative mt-7 block text-xl font-black leading-6">
                {localizeCurriculumText(specialty.title, language)}
              </span>
              <span className="relative mt-3 block text-xs font-bold uppercase tracking-wide text-ink/45">
                {copy.professionCode} · {specialty.professionCode}
              </span>
              <span
                className={`relative mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide ${
                  selected ? style.text : "text-ink/45"
                }`}
              >
                <span className={`size-2 rounded-full ${selected ? style.icon.split(" ")[0] : "bg-ink/20"}`} />
                {selected ? copy.selectedLabel : copy.selectLabel}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
