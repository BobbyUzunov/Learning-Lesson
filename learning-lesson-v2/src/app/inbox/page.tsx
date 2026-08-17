import { Bell } from "lucide-react";
import { redirect } from "next/navigation";
import { StudentInboxList } from "@/components/student-inbox-list";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { buildStudentInbox } from "@/lib/inbox/build-student-inbox";
import { getMyAssignments } from "@/lib/supabase/assignments";
import { getMyAssessments } from "@/lib/supabase/assessments";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [language, session] = await Promise.all([getLanguage(), requireUser()]);

  if (session.isTeacher && !session.isAdmin) {
    redirect("/teacher");
  }

  const copy = t(language);
  const [assignments, assessments] = await Promise.all([getMyAssignments(), getMyAssessments()]);
  const items = buildStudentInbox({ assignments, assessments, language });

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.nav.inbox}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.inbox.title}</h1>
      <p className="mt-3 max-w-2xl text-ink/60">{copy.inbox.subtitle}</p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-8 text-center">
          <Bell className="mx-auto size-8 text-ink/30" />
          <p className="mt-3 font-bold text-ink/70">{copy.inbox.empty}</p>
          <p className="mt-1 text-sm text-ink/50">{copy.inbox.emptyHint}</p>
        </div>
      ) : (
        <div className="mt-8">
          <StudentInboxList copy={copy.inbox} items={items} language={language} openLabel={copy.inbox.openItem} />
        </div>
      )}
    </main>
  );
}
