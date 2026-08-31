"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { mapAuthErrorMessage, type AuthErrorLabels } from "@/lib/auth-error";
import { isSignupPasswordValid, MIN_SIGNUP_PASSWORD_LENGTH } from "@/lib/auth-password";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  PasswordRequirementsChecklist,
  type PasswordRequirementsLabels
} from "@/components/password-requirements-checklist";
import { PasswordInput } from "@/components/password-input";

type ResetPasswordLabels = AuthErrorLabels & {
  newPassword: string;
  confirmPassword: string;
  updatePassword: string;
  working: string;
  missingConfig: string;
  mismatch: string;
  resetSuccess: string;
  sessionRequired: string;
  showPassword: string;
  hidePassword: string;
  passwordRequirements: PasswordRequirementsLabels;
};

export function ResetPasswordForm({ labels }: { labels: ResetPasswordLabels }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const configured = hasSupabaseEnv();

  useEffect(() => {
    if (!configured) {
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      if (!data.session) {
        setMessage(labels.sessionRequired);
      }
    });
  }, [configured, labels.sessionRequired]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured) {
      setMessage(labels.missingConfig);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(labels.mismatch);
      return;
    }

    if (!isSignupPasswordValid(password)) {
      setMessage(labels.passwordPolicy);
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage(mapAuthErrorMessage(error.message, labels));
      return;
    }

    setMessage(labels.resetSuccess);
    window.setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1200);
  }

  return (
    <form className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" onSubmit={submit}>
      <label className="block text-sm font-bold" htmlFor="new-password">
        {labels.newPassword}
      </label>
      <PasswordInput
        aria-describedby="password-requirements"
        autoComplete="new-password"
        hidePasswordLabel={labels.hidePassword}
        id="new-password"
        inputClassName="focus-ring w-full rounded-md border border-ink/15 bg-white px-3 py-3 pr-12"
        minLength={MIN_SIGNUP_PASSWORD_LENGTH}
        name="new-password"
        onChange={(event) => setPassword(event.target.value)}
        required
        showPasswordLabel={labels.showPassword}
        value={password}
        wrapperClassName="relative mt-2"
      />
      <PasswordRequirementsChecklist labels={labels.passwordRequirements} password={password} />
      <label className="mt-4 block text-sm font-bold" htmlFor="confirm-password">
        {labels.confirmPassword}
      </label>
      <PasswordInput
        autoComplete="new-password"
        hidePasswordLabel={labels.hidePassword}
        id="confirm-password"
        inputClassName="focus-ring w-full rounded-md border border-ink/15 bg-white px-3 py-3 pr-12"
        minLength={MIN_SIGNUP_PASSWORD_LENGTH}
        name="confirm-password"
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        showPasswordLabel={labels.showPassword}
        value={confirmPassword}
        wrapperClassName="relative mt-2"
      />
      <button
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading || !ready || !isSignupPasswordValid(password) || password !== confirmPassword}
        type="submit"
      >
        <KeyRound className="size-5" />
        {loading ? labels.working : labels.updatePassword}
      </button>
      {message ? <p className="mt-4 rounded-md bg-ink/10 px-3 py-2 text-sm text-ink/70">{message}</p> : null}
    </form>
  );
}
