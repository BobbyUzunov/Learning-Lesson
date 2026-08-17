"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Language } from "@/lib/i18n";

type SpecialtyOption = { id: string; title: string };

export function ClassroomSpecialtyForm({
  classroomId,
  language,
  specialties
}: {
  classroomId: string;
  language: Language;
  specialties: SpecialtyOption[];
}) {
  const copy = t(language).teacher;
  const router = useRouter();
  const [specialtyId, setSpecialtyId] = useState(specialties[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/teacher/classrooms/${classroomId}/specialty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialtyId })
      });
      if (!response.ok) {
        setError(copy.specialtySaveError);
        return;
      }
      router.refresh();
    } catch {
      setError(copy.specialtySaveError);
    } finally {
      setPending(false);
    }
  }

  if (specialties.length === 0) {
    return null;
  }

  return (
    <form
      className="mt-4 rounded-2xl border border-coral/20 bg-coral/5 px-4 py-4 sm:px-5"
      onSubmit={onSubmit}
    >
      <p className="text-sm font-semibold text-ink">{copy.specialtyMissing}</p>
      <label className="mt-3 block text-sm font-bold text-ink/75" htmlFor="classroom-specialty-fix">
        {copy.specialtyLabel}
        <select
          className="focus-ring mt-2 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5"
          id="classroom-specialty-fix"
          onChange={(event) => setSpecialtyId(event.target.value)}
          required
          value={specialtyId}
        >
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.title}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="mt-2 text-sm font-semibold text-coral">{error}</p> : null}
      <button
        className="focus-ring mt-3 inline-flex min-h-11 items-center rounded-xl bg-ink px-4 py-2 text-sm font-bold text-paper disabled:opacity-60"
        disabled={pending || !specialtyId}
        type="submit"
      >
        {pending ? copy.saving : copy.specialtySave}
      </button>
    </form>
  );
}
