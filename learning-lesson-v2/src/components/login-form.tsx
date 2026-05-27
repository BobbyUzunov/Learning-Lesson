"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type LoginLabels = {
  login: string;
  register: string;
  email: string;
  password: string;
  createAccount: string;
  working: string;
  missingConfig: string;
  loggedIn: string;
  registered: string;
};

export function LoginForm({ labels }: { labels: LoginLabels }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(mode === "login" ? labels.loggedIn : labels.registered);

    if (mode === "login") {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
      <div className="grid grid-cols-2 rounded-md bg-ink/10 p-1">
        <button
          className={`focus-ring rounded-md px-3 py-2 text-sm font-bold ${mode === "login" ? "bg-white shadow-sm" : ""}`}
          onClick={() => setMode("login")}
          type="button"
        >
          {labels.login}
        </button>
        <button
          className={`focus-ring rounded-md px-3 py-2 text-sm font-bold ${mode === "register" ? "bg-white shadow-sm" : ""}`}
          onClick={() => setMode("register")}
          type="button"
        >
          {labels.register}
        </button>
      </div>
      <label className="mt-5 block text-sm font-bold" htmlFor="email">
        {labels.email}
      </label>
      <input
        className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
        id="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      <label className="mt-4 block text-sm font-bold" htmlFor="password">
        {labels.password}
      </label>
      <input
        className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
        id="password"
        minLength={6}
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
      />
      <button
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-paper transition hover:bg-ink/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {mode === "login" ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
        {loading ? labels.working : mode === "login" ? labels.login : labels.createAccount}
      </button>
      {message ? <p className="mt-4 rounded-md bg-ink/10 px-3 py-2 text-sm text-ink/70">{message}</p> : null}
    </form>
  );
}
