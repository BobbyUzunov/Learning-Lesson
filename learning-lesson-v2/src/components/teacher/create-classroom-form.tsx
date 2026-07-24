"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

type SpecialtyOption = { id: string; title: string };

const gradeOptions = [8, 9, 10, 11, 12] as const;
const academicYearOptions = ["2025/2026", "2026/2027", "2027/2028"] as const;
const defaultAcademicYear = "2026/2027";

export function CreateClassroomForm({
  language,
  specialties
}: {
  language: Language;
  specialties: SpecialtyOption[];
}) {
  const copy = t(language);
  const router = useRouter();
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

    setLoading(false);

    if (!response.ok) {
      setError(copy.teacher.createError);
      return;
    }

    setName("");
    setDescription("");
    setSpecialtyId("");
    setGradeLevel(8);
    setAcademicYear(defaultAcademicYear);
    router.refresh();
  }

  return (
    <form className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" onSubmit={submit}>
      <h2 className="text-xl font-black">{copy.teacher.createTitle}</h2>
      <p className="mt-2 text-sm text-ink/70">{copy.teacher.createSubtitle}</p>

      <label className="mt-4 block text-sm font-bold text-ink/80" htmlFor="classroom-name">
        {copy.teacher.nameLabel}
      </label>
      <input
        className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
        id="classroom-name"
        maxLength={120}
        onChange={(event) => setName(event.target.value)}
        placeholder={copy.teacher.namePlaceholder}
        required
        value={name}
      />

      <label className="mt-4 block text-sm font-bold text-ink/80" htmlFor="classroom-description">
        {copy.teacher.descriptionLabel}
      </label>
      <textarea
        className="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
        id="classroom-description"
        maxLength={500}
        onChange={(event) => setDescription(event.target.value)}
        placeholder={copy.teacher.descriptionPlaceholder}
        value={description}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-bold text-ink/80" htmlFor="classroom-specialty">
            {copy.teacher.specialtyLabel}
          </label>
          <select
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
            id="classroom-specialty"
            onChange={(event) => setSpecialtyId(event.target.value)}
            value={specialtyId}
          >
            <option value="">{copy.teacher.specialtyNone}</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-ink/80" htmlFor="classroom-grade">
            {copy.teacher.gradeLabel}
          </label>
          <select
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
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
      </div>

      <label className="mt-4 block text-sm font-bold text-ink/80" htmlFor="classroom-year">
        {copy.teacher.academicYearLabel}
      </label>
      <select
        className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
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

      {error ? <p className="mt-4 rounded-md bg-coral/15 px-4 py-3 text-sm font-semibold text-ink">{error}</p> : null}

      <button
        className="focus-ring mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <Plus className="size-4" />
        {loading ? copy.teacher.creating : copy.teacher.createButton}
      </button>
    </form>
  );
}
