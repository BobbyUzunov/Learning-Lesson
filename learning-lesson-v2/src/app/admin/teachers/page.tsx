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
      <div>
        <p className="text-sm font-bold uppercase text-coral">{copy.admin.protected}</p>
        <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.admin.teachersTitle}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.teachersSubtitle}</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink/10 bg-white/80">
        {users.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink/60">{copy.admin.teachersEmpty}</p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-4 py-3">{copy.admin.nameColumn}</th>
                <th className="px-4 py-3">{copy.admin.emailColumn}</th>
                <th className="px-4 py-3">{copy.admin.roleColumn}</th>
                <th className="px-4 py-3">{copy.admin.actionColumn}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="border-t border-ink/10" key={user.id}>
                  <td className="px-4 py-3 font-bold">{user.display_name || copy.common.learner}</td>
                  <td className="px-4 py-3 break-words">{user.email ?? "—"}</td>
                  <td className="px-4 py-3">{roleLabel(user.role, copy)}</td>
                  <td className="px-4 py-3">
                    <PromoteTeacherButton language={language} role={user.role} userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
