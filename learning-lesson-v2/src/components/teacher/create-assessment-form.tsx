"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Plus, Trash2 } from "lucide-react";
import type { LocalizedAssessmentTemplate } from "@/lib/assessments/templates";
import { t, type Language } from "@/lib/i18n";

type QuestionDraft = {
  key: string;
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
  points: number;
};

function emptyQuestion(index: number): QuestionDraft {
  return {
    key: `question-${index}`,
    prompt: "",
    options: ["", "", ""],
    correctOption: 0,
    explanation: "",
    points: 1
  };
}

export function CreateAssessmentForm({
  classroomId,
  language,
  templates
}: {
  classroomId: string;
  language: Language;
  templates: LocalizedAssessmentTemplate[];
}) {
  const copy = t(language).assessment;
  const router = useRouter();
  const nextQuestionId = useRef(3);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("formative");
  const [dueAt, setDueAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("20");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion(1), emptyQuestion(2)]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  function loadTemplate() {
    if (!selectedTemplate) {
      return;
    }

    const firstQuestionId = nextQuestionId.current;
    setTitle(selectedTemplate.title);
    setDescription(selectedTemplate.description);
    setType(selectedTemplate.suggestedType);
    setDurationMinutes(String(selectedTemplate.durationMinutes));
    setQuestions(
      selectedTemplate.questions.map((question, index) => ({
        key: `${selectedTemplate.id}-${firstQuestionId + index}`,
        prompt: question.prompt,
        options: [...question.options],
        correctOption: question.correctOption,
        explanation: question.explanation,
        points: question.points
      }))
    );
    nextQuestionId.current += selectedTemplate.questions.length;
    setError(null);
  }

  function updateQuestion(index: number, update: Partial<QuestionDraft>) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...update } : question
      )
    );
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const question = questions[questionIndex];
    const options = question.options.map((option, index) => (index === optionIndex ? value : option));
    updateQuestion(questionIndex, { options });
  }

  function addOption(questionIndex: number) {
    const question = questions[questionIndex];
    if (question.options.length >= 6) {
      return;
    }
    updateQuestion(questionIndex, { options: [...question.options, ""] });
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const question = questions[questionIndex];
    if (question.options.length <= 2) {
      return;
    }
    const options = question.options.filter((_, index) => index !== optionIndex);
    let correctOption = question.correctOption;
    if (optionIndex === correctOption) {
      correctOption = 0;
    } else if (optionIndex < correctOption) {
      correctOption -= 1;
    }
    updateQuestion(questionIndex, { options, correctOption });
  }

  function addQuestion() {
    if (questions.length >= 30) {
      return;
    }
    setQuestions((current) => [...current, emptyQuestion(nextQuestionId.current++)]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 2) {
      return;
    }
    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/teacher/classrooms/${classroomId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          durationMinutes: durationMinutes ? Number(durationMinutes) : null,
          questions: questions.map(({ prompt, options, correctOption, explanation, points }) => ({
            prompt,
            options,
            correctOption,
            explanation,
            points
          }))
        })
      });
      const payload = (await response.json()) as { error?: string; assessment?: { id: string } };

      if (!response.ok || !payload.assessment) {
        setError(copy.createError);
        return;
      }

      router.push(`/teacher/classes/${classroomId}/assessments/${payload.assessment.id}`);
      router.refresh();
    } catch {
      setError(copy.createError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {templates.length > 0 ? (
        <section className="rounded-xl border border-violet/20 bg-violet/5 p-5 sm:p-6">
          <div className="flex gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet text-white">
              <BookOpenCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">{copy.templateTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-ink/65">{copy.templateSubtitle}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block text-sm font-bold">
              {copy.templateLabel}
              <select
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                value={selectedTemplateId}
              >
                <option value="">{copy.templateBlank}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.specialtyId === null ? copy.templateCommon : copy.templateSpecialty}: {template.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-violet px-5 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedTemplate}
              onClick={loadTemplate}
              type="button"
            >
              {copy.loadTemplate}
            </button>
          </div>

          {selectedTemplate ? (
            <p className="mt-3 text-sm leading-6 text-ink/65">
              {selectedTemplate.description} · {selectedTemplate.questions.length} {copy.templateQuestions}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold sm:col-span-2">
            {copy.titleLabel}
            <input
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
              maxLength={200}
              minLength={3}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={copy.titlePlaceholder}
              required
              value={title}
            />
          </label>

          <label className="block text-sm font-bold sm:col-span-2">
            {copy.descriptionLabel}
            <textarea
              className="mt-1 min-h-24 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={copy.descriptionPlaceholder}
              value={description}
            />
          </label>

          <label className="block text-sm font-bold">
            {copy.typeLabel}
            <select
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
              onChange={(event) => setType(event.target.value)}
              value={type}
            >
              <option value="diagnostic">{copy.typeDiagnostic}</option>
              <option value="formative">{copy.typeFormative}</option>
              <option value="summative">{copy.typeSummative}</option>
            </select>
          </label>

          <label className="block text-sm font-bold">
            {copy.dueAtLabel}
            <input
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
              onChange={(event) => setDueAt(event.target.value)}
              type="datetime-local"
              value={dueAt}
            />
          </label>

          <label className="block text-sm font-bold sm:max-w-xs">
            {copy.durationLabel} ({copy.minutes})
            <input
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
              max={180}
              min={5}
              onChange={(event) => setDurationMinutes(event.target.value)}
              type="number"
              value={durationMinutes}
            />
            <span className="mt-1 block text-xs font-normal leading-5 text-ink/50">{copy.durationHint}</span>
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black">{copy.questionsTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{copy.questionsSubtitle}</p>

        <div className="mt-4 space-y-4">
          {questions.map((question, questionIndex) => (
            <fieldset
              className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft sm:p-6"
              key={question.key}
            >
              <div className="flex items-center justify-between gap-3">
                <legend className="font-black">
                  {copy.questionLabel} {questionIndex + 1}
                </legend>
                {questions.length > 2 ? (
                  <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-coral hover:bg-coral/10"
                    onClick={() => removeQuestion(questionIndex)}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                    {copy.removeQuestion}
                  </button>
                ) : null}
              </div>

              <label className="mt-4 block text-sm font-bold">
                {copy.questionLabel}
                <textarea
                  className="mt-1 min-h-20 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
                  maxLength={1000}
                  minLength={3}
                  onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })}
                  placeholder={copy.questionPlaceholder}
                  required
                  value={question.prompt}
                />
              </label>

              <div className="mt-4 space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div className="flex items-center gap-2" key={`${question.key}-option-${optionIndex}`}>
                    <input
                      aria-label={`${copy.correctAnswer} ${optionIndex + 1}`}
                      checked={question.correctOption === optionIndex}
                      className="size-5 accent-violet"
                      name={`correct-${question.key}`}
                      onChange={() => updateQuestion(questionIndex, { correctOption: optionIndex })}
                      type="radio"
                    />
                    <input
                      aria-label={`${copy.optionLabel} ${optionIndex + 1}`}
                      className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2.5"
                      maxLength={500}
                      onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                      placeholder={`${copy.optionPlaceholder} ${optionIndex + 1}`}
                      required
                      value={option}
                    />
                    {question.options.length > 2 ? (
                      <button
                        aria-label={`${copy.removeOption} ${optionIndex + 1}`}
                        className="grid size-10 shrink-0 place-items-center rounded-md text-ink/45 hover:bg-ink/5 hover:text-coral"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        type="button"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {question.options.length < 6 ? (
                <button
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-bold text-violet"
                  onClick={() => addOption(questionIndex)}
                  type="button"
                >
                  <Plus className="size-4" />
                  {copy.addOption}
                </button>
              ) : null}

              <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
                <label className="block text-sm font-bold">
                  {copy.pointsLabel}
                  <input
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
                    max={100}
                    min={1}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { points: Number(event.target.value) })
                    }
                    required
                    type="number"
                    value={question.points}
                  />
                </label>
                <label className="block text-sm font-bold">
                  {copy.explanationLabel}
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5"
                    maxLength={2000}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { explanation: event.target.value })
                    }
                    placeholder={copy.explanationPlaceholder}
                    value={question.explanation}
                  />
                </label>
              </div>
            </fieldset>
          ))}
        </div>

        <button
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 font-bold"
          disabled={questions.length >= 30}
          onClick={addQuestion}
          type="button"
        >
          <Plus className="size-4" />
          {copy.addQuestion}
        </button>
      </section>

      {error ? <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm font-bold text-coral">{error}</p> : null}

      <button
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ink px-6 py-3 font-bold text-paper disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? copy.publishing : copy.publishButton}
      </button>
    </form>
  );
}
