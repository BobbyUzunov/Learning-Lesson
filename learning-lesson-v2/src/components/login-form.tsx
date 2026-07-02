"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { clearStoredProgress, getStoredProgress, guestContinueKey, getGameProgressStats } from "@/lib/game-progress";
import { xpPerLesson } from "@/lib/game-data";
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
};

export function LoginForm({
  initialMode = "login",
  labels,
  redirectPath = "/dashboard"
}: {
  initialMode?: "login" | "register";
  labels: LoginLabels;
  redirectPath?: string;
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const configured = hasSupabaseEnv();

  async function mergeGuestProgress(userId: string) {
    const supabase = createClient();
    const guestProgress = getStoredProgress();
    const guestCompletedLessonIds = guestProgress.completedLessonIds;

    if (guestCompletedLessonIds.length === 0) {
      return;
    }

    const guestXp = guestCompletedLessonIds.length * xpPerLesson;
    const guestLevel = getGameProgressStats(guestProgress).level;
    const completedRows = guestCompletedLessonIds.map((lessonId) => ({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      xp_earned: xpPerLesson,
      completed_at: new Date().toISOString()
    }));

    await supabase.from("user_progress").upsert(completedRows, { onConflict: "user_id,lesson_id" });

    const { data: existingProfile } = await supabase.from("profiles").select("xp,level").eq("id", userId).maybeSingle();
    const nextXp = Math.max(existingProfile?.xp ?? 0, guestXp);
    const nextLevel = Math.max(existingProfile?.level ?? 1, guestLevel);

    await supabase
      .from("profiles")
      .update({
        xp: nextXp,
        level: nextLevel
      })
      .eq("id", userId);

    clearStoredProgress();
    window.localStorage.removeItem(guestContinueKey);
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
                display_name: displayName.trim() || email.split("@")[0]
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

    const { error: profileError } = await ensureUserProfile(supabase, user, {
      displayName: displayName.trim() || undefined
    });

    if (profileError) {
      setLoading(false);
      setMessage(profileError.message);
      return;
    }

    await mergeGuestProgress(user.id);

    setLoading(false);
    setMessage(mode === "login" ? labels.loggedIn : labels.registered);
    router.replace(redirectPath.startsWith("/") ? redirectPath : "/dashboard");
    router.refresh();
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
      {mode === "register" ? (
        <>
          <label className="mt-5 block text-sm font-bold" htmlFor="displayName">
            {labels.displayName}
          </label>
          <input
            className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
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
        className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
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
        className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3"
        id="password"
        minLength={6}
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
      />
      {mode === "login" ? (
        <Link className="mt-2 inline-block text-sm font-bold text-ink/70 hover:text-ink" href="/forgot-password">
          {labels.forgotPassword}
        </Link>
      ) : null}
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
