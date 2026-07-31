"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getKnowledgeCheckTopicLabel } from "@/lib/knowledge-check/helpers";
import type { KnowledgeCheckQuestion, KnowledgeCheckTopic } from "@/lib/knowledge-check/types";
import { arrayToLines, linesToArray } from "@/lib/cms/serialize";
import { t, type Language } from "@/lib/i18n";

const KNOWLEDGE_CHECK_TOPICS: KnowledgeCheckTopic[] = [
  "html",
  "css",
  "javascript",
  "dom",
  "fetch",
  "react",
  "api",
  "quiz-generator",
  "fullstack",
  "ai",
  "mobile",
  "product"
];

export function AdminKnowledgeCheckEditor({
  language,
  question
}: {
  language: Language;
  question: KnowledgeCheckQuestion;
}) {
  const copy = t(language);
  const router = useRouter();
  const [form, setForm] = useState({
    topic: question.topic,
    question: question.question,
    questionBg: question.questionBg,
    options: arrayToLines(question.options),
    optionsBg: arrayToLines(question.optionsBg),
    correctIndex: String(question.correctIndex),
    explanation: question.explanation,
    explanationBg: question.explanationBg
  });
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const options = linesToArray(form.options);
    const optionsBg = linesToArray(form.optionsBg);
    if (options.length < 2 || optionsBg.length < 2) {
      setLoading(false);
      setMessage({ kind: "error", text: copy.admin.knowledgeCheckOptionsError });
      return;
    }

    const correctIndex = Number(form.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      setLoading(false);
      setMessage({ kind: "error", text: copy.admin.knowledgeCheckCorrectIndexError });
      return;
    }

    try {
      const response = await fetch(`/api/admin/knowledge-checks/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: form.topic,
          question: form.question,
          questionBg: form.questionBg,
          options,
          optionsBg,
          correctIndex,
          explanation: form.explanation,
          explanationBg: form.explanationBg
        })
      });

      if (!response.ok) {
        setMessage({ kind: "error", text: copy.admin.knowledgeCheckSaveError });
        return;
      }

      setMessage({ kind: "success", text: copy.admin.knowledgeCheckSaved });
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: copy.admin.knowledgeCheckSaveError });
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="mt-6 space-y-4 rounded-lg border border-ink/10 bg-white/80 p-5" onSubmit={saveQuestion}>
      <label className="block text-sm font-bold">
        {copy.admin.knowledgeCheckTopic}
        <select
          className="focus-ring mt-2 w-full max-w-sm rounded-md border border-ink/15 px-3 py-2"
          onChange={(event) => updateField("topic", event.target.value as KnowledgeCheckTopic)}
          value={form.topic}
        >
          {KNOWLEDGE_CHECK_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {getKnowledgeCheckTopicLabel(topic, language)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.knowledgeCheckQuestionEn}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("question", event.target.value)}
            value={form.question}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.knowledgeCheckQuestionBg}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("questionBg", event.target.value)}
            value={form.questionBg}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.knowledgeCheckOptionsEn}
          <textarea
            className="focus-ring mt-2 min-h-32 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("options", event.target.value)}
            placeholder={copy.admin.linesHint}
            value={form.options}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.knowledgeCheckOptionsBg}
          <textarea
            className="focus-ring mt-2 min-h-32 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("optionsBg", event.target.value)}
            placeholder={copy.admin.linesHint}
            value={form.optionsBg}
          />
        </label>
      </div>

      <label className="block text-sm font-bold">
        {copy.admin.knowledgeCheckCorrectIndex}
        <input
          className="focus-ring mt-2 w-full max-w-xs rounded-md border border-ink/15 px-3 py-2"
          min={0}
          onChange={(event) => updateField("correctIndex", event.target.value)}
          type="number"
          value={form.correctIndex}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold">
          {copy.admin.knowledgeCheckExplanationEn}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("explanation", event.target.value)}
            value={form.explanation}
          />
        </label>
        <label className="block text-sm font-bold">
          {copy.admin.knowledgeCheckExplanationBg}
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2"
            onChange={(event) => updateField("explanationBg", event.target.value)}
            value={form.explanationBg}
          />
        </label>
      </div>

      {message ? (
        <p
          aria-live="polite"
          className={`rounded-md px-4 py-3 text-sm font-bold text-ink ${
            message.kind === "success" ? "bg-mint/15" : "bg-coral/15"
          }`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      <button
        className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? copy.admin.seedWorking : copy.admin.saveKnowledgeCheck}
      </button>
    </form>
  );
}

/** @deprecated Use AdminKnowledgeCheckEditor. */
export const AdminQuizEditor = AdminKnowledgeCheckEditor;
