import { PromoteTeacherButton } from "@/components/admin/promote-teacher-button";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
};

function roleLabel(role: string, copy: ReturnType<typeof t>) {
  if (role === "admin") {
    return copy.admin.roleAdmin;
  }
  if (role === "teacher") {
    return copy.admin.roleTeacher;
  }
  return copy.admin.roleUser;
}

export default async function AdminTeachersPage() {
  const language = await getLanguage();
  const copy = t(language);

  let users: UserRow[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, display_name, role")
      .order("role", { ascending: true })
      .order("email", { ascending: true });
    users = (data ?? []) as UserRow[];
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.nav.roleAdmin}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.admin.teachersTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/60">{copy.admin.teachersSubtitle}</p>

      {users.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-6 text-sm text-ink/55">
          {copy.admin.teachersEmpty}
        </p>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
          {users.map((user, index) => (
            <li
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                index > 0 ? "border-t border-ink/8" : ""
              }`}
              key={user.id}
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink/85">{user.display_name || copy.common.learner}</p>
                <p className="mt-0.5 truncate text-xs text-ink/45">
                  {user.email ?? "—"} · {roleLabel(user.role, copy)}
                </p>
              </div>
              <PromoteTeacherButton language={language} role={user.role} userId={user.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
