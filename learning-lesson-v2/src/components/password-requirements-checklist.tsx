"use client";

import { Check, Circle } from "lucide-react";
import { formatMessage } from "@/lib/i18n";
import { getPasswordRequirementStatus, type PasswordRequirementId } from "@/lib/auth-password";

export type PasswordRequirementsLabels = {
  title: string;
  progress: string;
  length: string;
  lowercase: string;
  uppercase: string;
  digit: string;
  special: string;
};

const LABEL_BY_ID: Record<PasswordRequirementId, keyof PasswordRequirementsLabels> = {
  length: "length",
  lowercase: "lowercase",
  uppercase: "uppercase",
  digit: "digit",
  special: "special"
};

export function PasswordRequirementsChecklist({
  password,
  labels
}: {
  password: string;
  labels: PasswordRequirementsLabels;
}) {
  const requirements = getPasswordRequirementStatus(password);
  const metCount = requirements.filter((item) => item.met).length;

  return (
    <div
      aria-live="polite"
      className="mt-3 rounded-xl border border-ink/10 bg-paper/70 p-3"
      id="password-requirements"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink/75">{labels.title}</p>
        <p className="text-xs font-semibold text-ink/50">
          {formatMessage(labels.progress, { met: metCount, total: requirements.length })}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {requirements.map((item) => {
          const label = labels[LABEL_BY_ID[item.id]];
          return (
            <li className="flex items-start gap-2 text-sm leading-6" key={item.id}>
              {item.met ? (
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-mint" strokeWidth={3} />
              ) : (
                <Circle aria-hidden className="mt-0.5 size-4 shrink-0 text-ink/25" strokeWidth={2} />
              )}
              <span className={item.met ? "font-semibold text-ink" : "text-ink/60"}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
