"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { t, type Language } from "@/lib/i18n";

type MissionOption = {
  id: string;
  label: string;
  moduleTitle: string;
};

type AssignMissionFormProps = {
  classroomId: string;
  language: Language;
  missions: MissionOption[];
};

export function AssignMissionForm({ classroomId, language, missions }: AssignMissionFormProps) {
  const copy = t(language).teacher;
  const router = useRouter();
  const [missionId, setMissionId] = useState(missions[0]?.id ?? "");
  const [dueAt, setDueAt] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, MissionOption[]>();
    for (const mission of missions) {
      const list = map.get(mission.moduleTitle) ?? [];
      list.push(mission);
      map.set(mission.moduleTitle, list);
    }
    return [...map.entries()];
  }, [missions]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/teacher/classrooms/${classroomId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          instructions
        })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? copy.assignError);
        return;
      }

      setSuccess(true);
      setInstructions("");
      setDueAt("");
      router.refresh();
    } catch {
      setError(copy.assignError);
    } finally {
      setPending(false);
    }
  }

  if (missions.length === 0) {
    return null;
  }

  return (
    <form className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" onSubmit={onSubmit}>
      <h3 className="text-lg font-black">{copy.assignmentsTitle}</h3>
      <p className="mt-1 text-sm text-ink/60">{copy.assignmentsSubtitle}</p>

      <label className="mt-4 block text-sm font-bold">
        {copy.missionLabel}
        <select
          className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 font-medium"
          onChange={(event) => setMissionId(event.target.value)}
          required
          value={missionId}
        >
          {grouped.map(([moduleTitle, items]) => (
            <optgroup key={moduleTitle} label={moduleTitle}>
              {items.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-sm font-bold">
        {copy.dueAtLabel}
        <input
          className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
          onChange={(event) => setDueAt(event.target.value)}
          type="datetime-local"
          value={dueAt}
        />
      </label>

      <label className="mt-3 block text-sm font-bold">
        {copy.instructionsLabel}
        <textarea
          className="mt-1 min-h-24 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
          maxLength={2000}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder={copy.instructionsPlaceholder}
          value={instructions}
        />
      </label>

      {error ? <p className="mt-3 text-sm font-semibold text-coral">{error}</p> : null}
      {success ? <p className="mt-3 text-sm font-semibold text-mint">{copy.assignSuccess}</p> : null}

      <button
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 py-2 font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={pending || !missionId}
        type="submit"
      >
        {pending ? copy.assigning : copy.assignButton}
      </button>
    </form>
  );
}
