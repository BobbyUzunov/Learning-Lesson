import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

export function TeacherOnboardingChecklist({
  language,
  hasClassroom,
  hasStudents,
  hasAssessment
}: {
  language: Language;
  hasClassroom: boolean;
  hasStudents: boolean;
  hasAssessment: boolean;
}) {
  const copy = t(language).teacher;
  const steps = [
    {
      done: hasClassroom,
      title: copy.onboardingStepClassTitle,
      body: copy.onboardingStepClassBody,
      href: "/teacher" as const
    },
    {
      done: hasStudents,
      title: copy.onboardingStepInviteTitle,
      body: copy.onboardingStepInviteBody,
      href: "/teacher" as const
    },
    {
      done: hasAssessment,
      title: copy.onboardingStepAssessmentTitle,
      body: copy.onboardingStepAssessmentBody,
      href: "/teacher/assessments" as const
    },
    {
      done: hasAssessment && hasStudents,
      title: copy.onboardingStepReportTitle,
      body: copy.onboardingStepReportBody,
      href: "/teacher/assessments" as const
    }
  ];
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-violet/20 bg-violet/5 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet">{copy.onboardingEyebrow}</p>
          <h2 className="mt-2 text-xl font-black">{copy.onboardingTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink/70">{copy.onboardingSubtitle}</p>
        </div>
        <p className="text-sm font-bold text-ink/60">
          {completed}/{steps.length}
        </p>
      </div>
      <ol className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <li
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-ink/10 bg-white/80 px-4 py-3"
            key={step.title}
          >
            <div className="flex gap-3">
              {step.done ? (
                <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-mint" />
              ) : (
                <Circle aria-hidden className="mt-0.5 size-5 shrink-0 text-ink/30" />
              )}
              <div>
                <p className="font-bold">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-1 text-sm text-ink/65">{step.body}</p>
              </div>
            </div>
            {!step.done ? (
              <Link className="text-sm font-bold text-violet underline-offset-4 hover:underline" href={step.href}>
                {copy.onboardingAction}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
