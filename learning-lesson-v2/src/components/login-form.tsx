"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { mapAuthErrorMessage, type AuthErrorLabels } from "@/lib/auth-error";
import { clearStoredProgress, getStoredProgress, guestContinueKey } from "@/lib/game-progress-storage";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { PILOT_STUDENT_GRADE } from "@/lib/pilot";
import { ensureUserProfile } from "@/lib/supabase/profile";

type LoginLabels = AuthErrorLabels & {
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
  passwordHint: string;
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

function tabClass(active: boolean) {
  return `focus-ring inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2.5 transition ${
    active ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink/70"
  }`;
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
  const mode = initialMode;
  const registerHref = accountRole === "teacher" ? "/register/teacher" : "/register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
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

    if (submittingRef.current) {
      return;
    }

    if (!configured) {
      setStatus({ kind: "error", text: labels.missingConfig });
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setStatus(null);

    try {
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
                  intended_role: accountRole,
                  grade_level: accountRole === "user" ? PILOT_STUDENT_GRADE : undefined
                }
              }
            });

      if (result.error) {
        setStatus({ kind: "error", text: mapAuthErrorMessage(result.error.message, labels) });
        return;
      }

      if (mode === "register" && !result.data.session) {
        setStatus({ kind: "success", text: labels.registered });
        return;
      }

      const user = result.data.user ?? result.data.session?.user;
      if (!user) {
        setStatus({ kind: "success", text: labels.registered });
        return;
      }

      await supabase.auth.getSession();

      const { profile, error: profileError } = await ensureUserProfile(supabase, user, {
        displayName: displayName.trim() || undefined
      });

      if (profileError) {
        setStatus({ kind: "error", text: profileError.message });
        return;
      }

      await mergeGuestProgress();

      const requestedPath = redirectPath.startsWith("/") ? redirectPath : "/dashboard";
      const roleHome =
        profile?.role === "admin" ? "/admin" : profile?.role === "teacher" ? "/teacher" : "/dashboard";
      const nextPath =
        mode === "register"
          ? accountRole === "teacher"
            ? "/dashboard?teacherPending=1"
            : requestedPath === "/dashboard"
              ? "/classes"
              : requestedPath
          : requestedPath === "/dashboard"
            ? roleHome
            : requestedPath;

      setStatus({ kind: "success", text: mode === "login" ? labels.loggedIn : labels.registered });
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setStatus({
        kind: "error",
        text: error instanceof Error ? error.message : labels.guestProgressError
      });
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <form
      className="mx-auto max-w-md rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft sm:p-6"
      onSubmit={submit}
    >
      <div className="inline-grid w-full grid-cols-2 rounded-xl border border-ink/10 bg-ink/[0.04] p-0.5 text-sm font-bold">
        {mode === "login" ? (
          <span aria-current="page" className={tabClass(true)}>
            {labels.login}
          </span>
        ) : (
          <Link className={tabClass(false)} href="/login">
            {labels.login}
          </Link>
        )}
        {mode === "register" ? (
          <span aria-current="page" className={tabClass(true)}>
            {labels.register}
          </span>
        ) : (
          <Link className={tabClass(false)} href={registerHref}>
            {labels.register}
          </Link>
        )}
      </div>
      {mode === "register" ? (
        <>
          <label className="mt-5 block text-sm font-bold" htmlFor="displayName">
            {labels.displayName}
          </label>
          <input
            autoComplete="name"
            autoCapitalize="words"
            className="focus-ring mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-3 text-base"
            id="displayName"
            name="name"
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
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        className="focus-ring mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-3 text-base"
        id="email"
        inputMode="email"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder={labels.emailPlaceholder}
        required
        spellCheck={false}
        type="email"
        value={email}
      />
      <label className="mt-4 block text-sm font-bold" htmlFor="password">
        {labels.password}
      </label>
      <input
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        className="focus-ring mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-3 text-base"
        id="password"
        minLength={6}
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
      />
      {mode === "register" ? <p className="mt-2 text-sm text-ink/55">{labels.passwordHint}</p> : null}
      {mode === "login" ? (
        <Link className="mt-2 inline-block text-sm font-bold text-ink/55 hover:text-ink" href="/forgot-password">
          {labels.forgotPassword}
        </Link>
      ) : null}
      <button
        className="focus-ring mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 font-bold text-ink transition hover:bg-mint/90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {mode === "login" ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
        {loading ? labels.working : mode === "login" ? labels.login : labels.createAccount}
      </button>
      {status ? (
        <p
          className={`mt-4 rounded-xl px-3 py-2 text-sm font-semibold ${
            status.kind === "error" ? "bg-coral/10 text-coral" : "bg-mint/15 text-ink"
          }`}
          role={status.kind === "error" ? "alert" : "status"}
        >
          {status.text}
        </p>
      ) : null}
    </form>
  );
}
