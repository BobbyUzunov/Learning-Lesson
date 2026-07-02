"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Rocket } from "lucide-react";
import type { CourseProject, ProjectSubmissionRecord } from "@/lib/projects/types";
import { canLearnerEditSubmission } from "@/lib/projects/submissions";
import { t, type Language } from "@/lib/i18n";

export function ProjectSubmissionForm({
  existingSubmission,
  language,
  project
}: {
  existingSubmission: ProjectSubmissionRecord | null;
  language: Language;
  project: CourseProject;
}) {
  const copy = t(language);
  const router = useRouter();
  const [notes, setNotes] = useState(existingSubmission?.notes ?? "");
  const [repoUrl, setRepoUrl] = useState(existingSubmission?.repo_url ?? "");
  const [deployUrl, setDeployUrl] = useState(existingSubmission?.deploy_url ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canEdit = canLearnerEditSubmission(project, existingSubmission ?? undefined);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, repoUrl, deployUrl })
    });

    setLoading(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      const errorKey = body.error as keyof typeof copy.projects.errors | undefined;
      setMessage(errorKey ? copy.projects.errors[errorKey] ?? copy.projects.errors.default : copy.projects.errors.default);
      return;
    }

    setMessage(project.type === "capstone" ? copy.projects.submittedCapstone : copy.projects.submitted);
    router.refresh();
  }

  if (!canEdit) {
    return (
      <p className="mt-8 rounded-md bg-ink/5 px-4 py-3 text-sm font-semibold text-ink/70">{copy.projects.pendingReviewLocked}</p>
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <section className="rounded-lg border border-ink/10 bg-white/85 p-5">
        <h2 className="text-xl font-black">{copy.projects.checklistTitle}</h2>
        <ul className="mt-4 space-y-2">
          {project.checklist.map((item) => (
            <li className="flex items-start gap-2 text-sm leading-6 text-ink/75" key={item.id}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white/85 p-5">
        <label className="text-sm font-black uppercase tracking-wide text-ink/70" htmlFor="project-notes">
          {project.briefLabel}
        </label>
        <textarea
          className="focus-ring mt-3 min-h-40 w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm leading-6"
          id="project-notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder={project.briefPlaceholder}
          value={notes}
        />
        <p className="mt-2 text-xs font-semibold text-ink/50">
          {copy.projects.minChars}: {project.briefMinLength}
        </p>
      </section>

      {project.requiresRepo ? (
        <section className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <label className="text-sm font-black uppercase tracking-wide text-ink/70" htmlFor="project-repo">
            {copy.projects.repoUrl}
          </label>
          <input
            className="focus-ring mt-3 w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm"
            id="project-repo"
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/you/your-repo"
            type="url"
            value={repoUrl}
          />
        </section>
      ) : null}

      {project.requiresDeploy ? (
        <section className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <label className="text-sm font-black uppercase tracking-wide text-ink/70" htmlFor="project-deploy">
            {copy.projects.deployUrl}
          </label>
          <input
            className="focus-ring mt-3 w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm"
            id="project-deploy"
            onChange={(event) => setDeployUrl(event.target.value)}
            placeholder="https://your-app.vercel.app"
            type="url"
            value={deployUrl}
          />
        </section>
      ) : null}

      {message ? (
        <p className="rounded-md bg-mint/15 px-4 py-3 text-sm font-bold text-ink">{message}</p>
      ) : null}

      <button
        className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-4 text-lg font-black text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <Rocket className="size-5" />
        {loading
          ? copy.projects.submitting
          : existingSubmission?.submitted_at
            ? copy.projects.resubmit
            : copy.projects.submit}
      </button>
    </form>
  );
}
