"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

type SpecialtyOption = { id: string; title: string };

const gradeOptions = [8, 9, 10, 11, 12] as const;
const academicYearOptions = ["2025/2026", "2026/2027", "2027/2028"] as const;
const defaultAcademicYear = "2026/2027";

const fieldClass =
  "focus-ring mt-2 w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 transition placeholder:text-ink/30";

export function CreateClassroomForm({
  language,
  specialties,
  defaultOpen = false
}: {
  language: Language;
  specialties: SpecialtyOption[];
  defaultOpen?: boolean;
}) {
  const copy = t(language);
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [gradeLevel, setGradeLevel] = useState(8);
  const [academicYear, setAcademicYear] = useState<string>(defaultAcademicYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/teacher/classrooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        specialtyId: specialtyId || null,
        gradeLevel,
        academicYear
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | { classroom?: { id?: string } }
      | null;

    setLoading(false);

    if (!response.ok || !payload?.classroom?.id) {
      setError(copy.teacher.createError);
      return;
    }

    router.push(`/teacher/classes/${payload.classroom.id}`);
    router.refresh();
  }

  if (!open) {
    return (
      <div id="create">
        <button
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:-translate-y-0.5 hover:bg-ink/90"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Plus className="size-4" />
          {copy.teacher.createButton}
        </button>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft sm:p-6"
      id="create"
      onSubmit={submit}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">{copy.teacher.createTitle}</h2>
          <p className="mt-1 text-sm text-ink/55">{copy.teacher.createSubtitleFast}</p>
        </div>
        {!defaultOpen ? (
          <button
            className="text-sm font-bold text-ink/45 underline-offset-4 transition hover:text-ink hover:underline"
            onClick={() => setOpen(false)}
            type="button"
          >
            {copy.teacher.cancelCreate}
          </button>
        ) : null}
      </div>

      <label className="mt-5 block text-sm font-bold text-ink/75" htmlFor="classroom-name">
        {copy.teacher.nameLabel}
      </label>
      <input
        autoFocus
        className={fieldClass}
        id="classroom-name"
        maxLength={120}
        onChange={(event) => setName(event.target.value)}
        placeholder={copy.teacher.namePlaceholder}
        required
        value={name}
      />

      <label className="mt-4 block text-sm font-bold text-ink/75" htmlFor="classroom-specialty">
        {copy.teacher.specialtyLabel}
      </label>
      <p className="mt-1 text-sm text-ink/50">{copy.teacher.specialtyHint}</p>
      <select
        className={fieldClass}
        id="classroom-specialty"
        onChange={(event) => setSpecialtyId(event.target.value)}
        required
        value={specialtyId}
      >
        <option value="">{copy.teacher.specialtyNone}</option>
        {specialties.map((specialty) => (
          <option key={specialty.id} value={specialty.id}>
            {specialty.title}
          </option>
        ))}
      </select>

      <details className="mt-4 rounded-xl border border-ink/10 bg-paper/60 px-3.5 py-2.5">
        <summary className="cursor-pointer list-none text-sm font-bold text-ink/65 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <ChevronDown className="size-4" />
            {copy.teacher.moreOptions}
          </span>
        </summary>
        <div className="mt-3 pb-1">
          <label className="block text-sm font-bold text-ink/75" htmlFor="classroom-description">
            {copy.teacher.descriptionLabel}
          </label>
          <textarea
            className={`${fieldClass} min-h-16`}
            id="classroom-description"
            maxLength={500}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={copy.teacher.descriptionPlaceholder}
            value={description}
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-ink/75" htmlFor="classroom-grade">
                {copy.teacher.gradeLabel}
              </label>
              <select
                className={fieldClass}
                id="classroom-grade"
                onChange={(event) => setGradeLevel(Number(event.target.value))}
                value={gradeLevel}
              >
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/75" htmlFor="classroom-year">
                {copy.teacher.academicYearLabel}
              </label>
              <select
                className={fieldClass}
                id="classroom-year"
                onChange={(event) => setAcademicYear(event.target.value)}
                value={academicYear}
              >
                {academicYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </details>

      {error ? <p className="mt-4 rounded-xl bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">{error}</p> : null}

      <button
        className="focus-ring mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mint/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <Plus className="size-4" />
        {loading ? copy.teacher.creating : copy.teacher.createButton}
      </button>
    </form>
  );
}
