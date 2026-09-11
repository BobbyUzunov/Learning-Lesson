"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DueDateField } from "@/components/due-date-field";
import { ActionToast } from "@/components/action-toast";
import { CUSTOM_QUESTION_MAX, CUSTOM_QUESTION_MIN } from "@/lib/assignments/custom";
import { t, type Language } from "@/lib/i18n";

type MissionOption = {
  id: string;
  label: string;
  groupKey: string;
  groupLabel: string;
};

type AssignMissionFormProps = {
  classroomId: string;
  language: Language;
  missions: MissionOption[];
};

type AssignCopy = ReturnType<typeof t>["teacher"];
type AssignSource = "program" | "custom";

function assignErrorMessage(copy: AssignCopy, code?: string) {
  if (code === "teacher_required" || code === "not_authenticated") {
    return copy.assignErrorAuth;
  }
  if (code === "assignment_exists") {
    return copy.assignErrorExists;
  }
  if (code === "not_authorized") {
    return copy.assignErrorUnauthorized;
  }
  if (code === "unknown_mission") {
    return copy.assignErrorUnknownMission;
  }
  if (code === "invalid_title") {
    return copy.assignErrorInvalidTitle;
  }
  if (code === "invalid_questions") {
    return copy.assignErrorInvalidQuestions;
  }
  return copy.assignError;
}

function sourceButtonClass(active: boolean) {
  return active
    ? "bg-ink text-paper"
    : "border border-ink/12 bg-white text-ink/70 hover:border-ink/25 hover:text-ink";
}

export function AssignMissionForm({ classroomId, language, missions }: AssignMissionFormProps) {
  const localized = t(language);
  const copy = localized.teacher;
  const router = useRouter();
  const hasProgramMissions = missions.length > 0;
  const [open, setOpen] = useState(false);
  const nextQuestionKey = useRef(3);
  const [selectedSource, setSelectedSource] = useState<AssignSource>(hasProgramMissions ? "program" : "custom");
  const source: AssignSource = hasProgramMissions ? selectedSource : "custom";
  const [missionId, setMissionId] = useState(missions[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { key: "question-1", text: "" },
    { key: "question-2", text: "" }
  ]);
  const [dueAt, setDueAt] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, MissionOption[]>();
    for (const mission of missions) {
      const list = map.get(mission.groupKey) ?? [];
      list.push(mission);
      map.set(mission.groupKey, list);
    }
    return [...map.entries()].map(([groupKey, items]) => ({
      groupKey,
      groupLabel: items[0]?.groupLabel ?? groupKey,
      items
    }));
  }, [missions]);

  const filledQuestions = questions.map((question) => question.text.trim()).filter(Boolean);
  const canSubmit =
    source === "custom" ? title.trim().length >= 3 && filledQuestions.length >= CUSTOM_QUESTION_MIN : Boolean(missionId);

  function resetCustomFields() {
    setTitle("");
    setQuestions([
      { key: "question-1", text: "" },
      { key: "question-2", text: "" }
    ]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/teacher/classrooms/${classroomId}/assignments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          source === "custom"
            ? {
                title,
                questions: filledQuestions,
                dueAt: dueAt ? new Date(dueAt).toISOString() : null,
                instructions
              }
            : {
                missionId,
                dueAt: dueAt ? new Date(dueAt).toISOString() : null,
                instructions
              }
        )
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(assignErrorMessage(copy, payload.error));
        return;
      }

      setSuccess(true);
      setInstructions("");
      setDueAt("");
      resetCustomFields();
      setOpen(false);
      router.refresh();
    } catch {
      setError(copy.assignError);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <div>
        {success ? <ActionToast closeLabel={localized.common.close} message={copy.assignSuccess} onDismiss={() => setSuccess(false)} tone="success" /> : null}
        <button
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm font-bold text-ink/75 transition hover:border-ink/25 hover:text-ink"
          onClick={() => {
            setSuccess(false);
            setOpen(true);
          }}
          type="button"
        >
          <Plus className="size-4" />
          {copy.assignButton}
        </button>
      </div>
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

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={`focus-ring min-h-11 rounded-xl px-3 text-sm font-bold transition disabled:opacity-45 ${sourceButtonClass(source === "program")}`}
          disabled={!hasProgramMissions}
          onClick={() => setSelectedSource("program")}
          type="button"
        >
          {copy.assignSourceProgram}
        </button>
        <button
          className={`focus-ring min-h-11 rounded-xl px-3 text-sm font-bold transition ${sourceButtonClass(source === "custom")}`}
          onClick={() => setSelectedSource("custom")}
          type="button"
        >
          {copy.assignSourceCustom}
        </button>
      </div>

      {source === "program" ? (
        <label className="mt-4 block text-sm font-bold text-ink/75">
          {copy.missionLabel}
          <select
            className="focus-ring mt-2 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5 font-medium"
            onChange={(event) => setMissionId(event.target.value)}
            required
            value={missionId}
          >
            {grouped.map((group) => (
              <optgroup key={group.groupKey} label={group.groupLabel}>
                {group.items.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-ink/55">{copy.assignCustomHint}</p>
          <label className="mt-3 block text-sm font-bold text-ink/75">
            {copy.customMissionTitle}
            <input
              className="focus-ring mt-2 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5 font-medium"
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={copy.customMissionTitlePlaceholder}
              required
              value={title}
            />
          </label>
          <fieldset className="mt-3">
            <legend className="text-sm font-bold text-ink/75">{copy.customQuestionsLabel}</legend>
            <div className="mt-2 space-y-2">
              {questions.map((question, index) => (
                <div className="flex gap-2" key={question.key}>
                  <label className="sr-only" htmlFor={question.key}>
                    {copy.customQuestionN.replace("{n}", String(index + 1))}
                  </label>
                  <input
                    className="focus-ring min-w-0 flex-1 rounded-xl border border-ink/12 bg-white px-3 py-2.5"
                    id={question.key}
                    maxLength={400}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item) =>
                          item.key === question.key ? { ...item, text: event.target.value } : item
                        )
                      )
                    }
                    placeholder={copy.customQuestionPlaceholder}
                    value={question.text}
                  />
                  {questions.length > CUSTOM_QUESTION_MIN ? (
                    <button
                      className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl border border-ink/12 text-ink/45 hover:border-coral/40 hover:text-coral"
                      onClick={() =>
                        setQuestions((current) => current.filter((item) => item.key !== question.key))
                      }
                      type="button"
                    >
                      <span className="sr-only">{copy.removeQuestion}</span>
                      <Trash2 className="size-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            {questions.length < CUSTOM_QUESTION_MAX ? (
              <button
                className="focus-ring mt-2 inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-ink/60 hover:text-ink"
                onClick={() =>
                  setQuestions((current) => [
                    ...current,
                    { key: `question-${nextQuestionKey.current++}`, text: "" }
                  ])
                }
                type="button"
              >
                <Plus className="size-4" />
                {copy.addQuestion}
              </button>
            ) : null}
          </fieldset>
        </div>
      )}

      <div className="mt-3">
        <DueDateField language={language} label={copy.dueAtLabel} onChange={setDueAt} value={dueAt} />
      </div>

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

      {error ? <ActionToast closeLabel={localized.common.close} message={error} onDismiss={() => setError(null)} tone="error" /> : null}

      <button
        className="focus-ring mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-4 py-2.5 font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={pending || !canSubmit}
        type="submit"
      >
        {pending ? copy.assigning : copy.assignButton}
      </button>
    </form>
  );
}
