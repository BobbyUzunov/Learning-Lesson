"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { clearStoredProgress, getStoredProgress, guestContinueKey } from "@/lib/game-progress-storage";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ensureUserProfile } from "@/lib/supabase/profile";

type LoginLabels = {
  login: string;
  register: string;
  email: string;
  password: string;
  displayName: string;
  emailPlaceholder: string;
  displayNamePlaceholder: string;
  createAccount: string;
  working: string;
  missingConfig: string;
  loggedIn: string;
  registered: string;
  forgotPassword: string;
  guestProgressError: string;
};

export function isGuestMergeSettled(response: Pick<Response, "ok" | "status">) {
  return response.ok || response.status === 409;
}

export function discardLocalGuestProgress(
  clearProgress: () => void = clearStoredProgress,
  storage: Pick<Storage, "removeItem"> = window.localStorage
) {
  // Local guest data is best-effort cleanup. A storage failure must not turn an
  // already successful authentication into a blocked login.
  try {
    clearProgress();
  } catch {
    // Ignore unavailable or quota-restricted browser storage.
  }

  try {
    storage.removeItem(guestContinueKey);
  } catch {
    // Ignore unavailable or quota-restricted browser storage.
  }
}

export function LoginForm({
  initialMode = "login",
  labels,
  redirectPath = "/dashboard",
  accountRole = "user"
}: {
  initialMode?: "login" | "register";
  labels: LoginLabels;
  redirectPath?: string;
  accountRole?: "user" | "teacher";
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const configured = hasSupabaseEnv();

  async function mergeGuestProgress() {
    const guestProgress = getStoredProgress();
    const guestCompletedLessonIds = guestProgress.completedLessonIds;

    if (guestCompletedLessonIds.length === 0) {
      return;
    }

    const response = await fetch("/api/progress/merge-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonIds: guestCompletedLessonIds })
    });

    if (!isGuestMergeSettled(response)) {
      throw new Error(labels.guestProgressError);
    }

    discardLocalGuestProgress();
  }

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
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/verify-email`,
              data: {
                display_name: displayName.trim() || email.split("@")[0],
                intended_role: accountRole
              }
            }
          });

    if (result.error) {
      setLoading(false);
      setMessage(result.error.message);
      return;
    }

    if (mode === "register" && !result.data.session) {
      setLoading(false);
      setMessage(labels.registered);
      return;
    }

    const user = result.data.user ?? result.data.session?.user;
    if (!user) {
      setLoading(false);
      setMessage(labels.registered);
      return;
    }

    await supabase.auth.getSession();

    const { profile, error: profileError } = await ensureUserProfile(supabase, user, {
      displayName: displayName.trim() || undefined,
      role: mode === "register" ? accountRole : undefined
    });

    if (profileError) {
      setLoading(false);
      setMessage(profileError.message);
      return;
    }

    try {
      await mergeGuestProgress();
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : labels.guestProgressError);
      return;
    }

    const requestedPath = redirectPath.startsWith("/") ? redirectPath : "/dashboard";
    const roleHome =
      profile?.role === "admin" ? "/admin" : profile?.role === "teacher" ? "/teacher" : "/dashboard";
    const nextPath =
      mode === "register"
        ? accountRole === "teacher"
          ? "/teacher"
          : requestedPath === "/dashboard"
            ? "/classes"
            : requestedPath
        : requestedPath === "/dashboard"
          ? roleHome
          : requestedPath;

    setLoading(false);
    setMessage(mode === "login" ? labels.loggedIn : labels.registered);
    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form
      className="mx-auto max-w-md rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft sm:p-6"
      onSubmit={submit}
    >
      <div className="inline-grid w-full grid-cols-2 rounded-xl border border-ink/10 bg-ink/[0.04] p-0.5 text-sm font-bold">
        <button
          className={`focus-ring rounded-lg px-3 py-2.5 transition ${
            mode === "login" ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink/70"
          }`}
          onClick={() => setMode("login")}
          type="button"
        >
          {labels.login}
        </button>
        <button
          className={`focus-ring rounded-lg px-3 py-2.5 transition ${
            mode === "register" ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink/70"
          }`}
          onClick={() => setMode("register")}
          type="button"
        >
          {labels.register}
        </button>
      </div>
      {mode === "register" ? (
        <>
          <label className="mt-5 block text-sm font-bold" htmlFor="displayName">
            {labels.displayName}
          </label>
          <input
            className="focus-ring mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-3"
            id="displayName"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={labels.displayNamePlaceholder}
            type="text"
            value={displayName}
          />
        </>
      ) : null}
      <label className="mt-5 block text-sm font-bold" htmlFor="email">
        {labels.email}
      </label>
      <input
        className="focus-ring mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-3"
        id="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder={labels.emailPlaceholder}
        required
        type="email"
        value={email}
      />
      <label className="mt-4 block text-sm font-bold" htmlFor="password">
        {labels.password}
      </label>
      <input
        className="focus-ring mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-3"
        id="password"
        minLength={6}
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
      />
      {mode === "login" ? (
        <Link className="mt-2 inline-block text-sm font-bold text-ink/55 hover:text-ink" href="/forgot-password">
          {labels.forgotPassword}
        </Link>
      ) : null}
      <button
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 font-bold text-ink transition hover:bg-mint/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {mode === "login" ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
        {loading ? labels.working : mode === "login" ? labels.login : labels.createAccount}
      </button>
      {message ? <p className="mt-4 rounded-xl bg-ink/5 px-3 py-2 text-sm text-ink/70">{message}</p> : null}
    </form>
  );
}
