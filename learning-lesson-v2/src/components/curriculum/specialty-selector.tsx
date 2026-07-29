"use client";

import { BrainCircuit, Code2, Palette, ShieldCheck } from "lucide-react";
import type { CurriculumExplorerCopy, CurriculumExplorerSpecialty } from "@/lib/curriculum/explorer";
import type { CurriculumIcon } from "@/lib/curriculum/types";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";

const specialtyIcons: Record<CurriculumIcon, typeof Code2> = {
  code: Code2,
  brain: BrainCircuit,
  palette: Palette,
  shield: ShieldCheck
};

type SpecialtySelectorProps = {
  copy: CurriculumExplorerCopy;
  onSelect: (specialtyId: string) => void;
  selectedId: string;
  specialties: CurriculumExplorerSpecialty[];
};

export function SpecialtySelector({ copy, onSelect, selectedId, specialties }: SpecialtySelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">{copy.chooseSpecialty}</legend>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {specialties.map((specialty) => {
          const Icon = specialtyIcons[specialty.icon];
          const selected = specialty.id === selectedId;
          const style = curriculumAccentStyles[specialty.accent];

          return (
            <button
              aria-controls="recommended-mission"
              aria-pressed={selected}
              className={`focus-ring group relative overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                selected ? `${style.border} ${style.soft} shadow-sm` : "border-ink/10 bg-white hover:border-ink/25"
              }`}
              key={specialty.id}
              onClick={() => onSelect(specialty.id)}
              type="button"
            >
              <span className="relative flex items-center gap-3">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${style.icon}`}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black leading-5 sm:text-base">
                    {specialty.title}
                  </span>
                  <span className={`mt-1 block text-xs font-bold ${selected ? style.text : "text-ink/40"}`}>
                    {selected ? copy.selectedLabel : copy.selectLabel}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
