"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
  const [open, setOpen] = useState(false);
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
      setOpen(false);
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

  if (!open) {
    return (
      <button
        className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm font-bold text-ink/75 transition hover:border-ink/25 hover:text-ink"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Plus className="size-4" />
        {copy.assignButton}
      </button>
    );
  }

  return (
    <form className="rounded-2xl border border-ink/10 bg-white/80 p-5" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight">{copy.assignButton}</h3>
          <p className="mt-1 text-sm text-ink/55">{copy.assignmentsSubtitle}</p>
        </div>
        <button
          className="text-sm font-bold text-ink/45 underline-offset-4 hover:text-ink hover:underline"
          onClick={() => setOpen(false)}
          type="button"
        >
          {copy.cancelCreate}
        </button>
      </div>

      <label className="mt-4 block text-sm font-bold text-ink/75">
        {copy.missionLabel}
        <select
          className="focus-ring mt-2 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5 font-medium"
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

      <label className="mt-3 block text-sm font-bold text-ink/75">
        {copy.dueAtLabel}
        <input
          className="focus-ring mt-2 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5"
          onChange={(event) => setDueAt(event.target.value)}
          type="datetime-local"
          value={dueAt}
        />
      </label>

      <details className="mt-3 rounded-xl border border-ink/10 bg-paper/50 px-3 py-2">
        <summary className="cursor-pointer list-none text-sm font-bold text-ink/60 [&::-webkit-details-marker]:hidden">
          {copy.moreOptions}
        </summary>
        <label className="mt-3 block text-sm font-bold text-ink/75">
          {copy.instructionsLabel}
          <textarea
            className="focus-ring mt-2 min-h-20 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5"
            maxLength={2000}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder={copy.instructionsPlaceholder}
            value={instructions}
          />
        </label>
      </details>

      {error ? <p className="mt-3 text-sm font-semibold text-coral">{error}</p> : null}
      {success ? <p className="mt-3 text-sm font-semibold text-mint">{copy.assignSuccess}</p> : null}

      <button
        className="focus-ring mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-4 py-2.5 font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={pending || !missionId}
        type="submit"
      >
        {pending ? copy.assigning : copy.assignButton}
      </button>
    </form>
  );
}
