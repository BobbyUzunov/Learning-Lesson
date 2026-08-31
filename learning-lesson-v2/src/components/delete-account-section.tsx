"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { t, type Language } from "@/lib/i18n";

export function DeleteAccountSection({ language }: { language: Language }) {
  const copy = t(language);
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phrase = copy.accountDeletion.confirmPhrase;
  const canSubmit = confirmText.trim().toUpperCase() === phrase && !loading;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      const code = payload?.error ?? "";
      if (code === "teacher_has_classrooms") {
        setError(copy.accountDeletion.teacherBlocked);
      } else if (code === "admin_account_protected") {
        setError(copy.accountDeletion.adminBlocked);
      } else if (code === "account_delete_unavailable" || code === "supabase_not_configured") {
        setError(copy.accountDeletion.unavailable);
      } else {
        setError(copy.accountDeletion.error);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login?message=account_deleted");
    router.refresh();
  }

  return (
    <section className="mt-6 rounded-lg border border-coral/25 bg-coral/5 p-4 sm:p-5">
      <h2 className="text-sm font-bold uppercase text-coral">{copy.accountDeletion.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">{copy.accountDeletion.subtitle}</p>

      <form className="mt-4 space-y-3" onSubmit={submit}>
        <label className="block text-sm font-bold text-ink/75" htmlFor="delete-account-confirm">
          {copy.accountDeletion.confirmLabel}
        </label>
        <input
          autoComplete="off"
          className="focus-ring w-full rounded-md border border-ink/15 bg-white px-3 py-3 font-mono text-sm uppercase tracking-[0.12em]"
          id="delete-account-confirm"
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder={phrase}
          spellCheck={false}
          value={confirmText}
        />
        <button
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-coral px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
          type="submit"
        >
          {loading ? copy.accountDeletion.working : copy.accountDeletion.button}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-md bg-coral/15 px-4 py-3 text-sm font-semibold text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
