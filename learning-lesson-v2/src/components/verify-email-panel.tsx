"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type VerifyEmailLabels = {
  title: string;
  subtitle: string;
  verified: string;
  pending: string;
  resend: string;
  working: string;
  sent: string;
  missingConfig: string;
  backToDashboard: string;
};

export function VerifyEmailPanel({
  email,
  labels,
  verified
}: {
  email: string | null;
  labels: VerifyEmailLabels;
  verified: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = hasSupabaseEnv();

  useEffect(() => {
    setMessage(verified ? labels.verified : labels.pending);
  }, [labels.pending, labels.verified, verified]);

  async function resend() {
    if (!configured || !email || verified) {
      setMessage(labels.missingConfig);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/verify-email`;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo }
    });

    setLoading(false);
    setMessage(error ? error.message : labels.sent);
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
        <MailCheck className="size-4 text-violet" />
        {labels.title}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/70">{labels.subtitle}</p>
      {email ? <p className="mt-3 break-words text-sm font-bold text-ink/60">{email}</p> : null}
      {message ? <p className="mt-4 rounded-md bg-ink/10 px-3 py-2 text-sm text-ink/70">{message}</p> : null}
      {!verified ? (
        <button
          className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-paper disabled:opacity-60"
          disabled={loading}
          onClick={() => void resend()}
          type="button"
        >
          <RefreshCw className="size-5" />
          {loading ? labels.working : labels.resend}
        </button>
      ) : null}
      <Link className="mt-4 inline-block text-sm font-bold text-ink/70 hover:text-ink" href="/dashboard">
        {labels.backToDashboard}
      </Link>
    </section>
  );
}
