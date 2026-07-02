"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type ForgotPasswordLabels = {
  email: string;
  emailPlaceholder: string;
  sendLink: string;
  working: string;
  missingConfig: string;
  sentMessage: string;
  backToLogin: string;
};

export function ForgotPasswordForm({ labels }: { labels: ForgotPasswordLabels }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = hasSupabaseEnv();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured) {
      setMessage(labels.missingConfig);
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setLoading(false);
    setMessage(error ? error.message : labels.sentMessage);
  }

  return (
    <form className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft" onSubmit={submit}>
      <label className="block text-sm font-bold" htmlFor="reset-email">
        {labels.email}
      </label>
      <input
        className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
        id="reset-email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder={labels.emailPlaceholder}
        required
        type="email"
        value={email}
      />
      <button
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <Mail className="size-5" />
        {loading ? labels.working : labels.sendLink}
      </button>
      {message ? <p className="mt-4 rounded-md bg-ink/10 px-3 py-2 text-sm text-ink/70">{message}</p> : null}
      <Link className="mt-4 inline-block text-sm font-bold text-ink/70 hover:text-ink" href="/login">
        {labels.backToLogin}
      </Link>
    </form>
  );
}
