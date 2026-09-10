import Link from "next/link";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";

export async function PageUnavailable({ reason }: { reason: "not-found" | "access-denied" }) {
  const [language, session] = await Promise.all([getLanguage(), getCurrentSession()]);
  const bg = language === "bg";
  const denied = reason === "access-denied";
  const home = session.isAdmin ? "/admin" : session.isTeacher ? "/teacher" : session.user ? "/dashboard" : "/";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <p className="text-sm font-bold text-ink/55">{denied ? (bg ? "Ограничен достъп" : "Restricted access") : "404"}</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {denied ? (bg ? "Нямаш достъп до тази страница" : "You do not have access to this page") : (bg ? "Страницата не е намерена" : "Page not found")}
      </h1>
      <p className="mt-4 text-base leading-7 text-ink/65">
        {denied
          ? (bg ? "Твоят профил няма необходимата роля. Ако очакваш учителски или администраторски достъп, свържи се с администратора на платформата." : "Your account does not have the required role. If you expect teacher or administrator access, contact the platform administrator.")
          : (bg ? "Адресът може да е грешен или страницата вече да не е налична. Провери връзката или се върни към началото." : "The address may be incorrect or the page may no longer be available. Check the link or return home.")}
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link className="focus-ring rounded-xl bg-ink px-4 py-3 font-bold text-paper" href={home}>
          {bg ? "Към началото" : "Go home"}
        </Link>
        {denied ? <Link className="focus-ring rounded-xl border border-ink/20 px-4 py-3 font-bold" href="/contact">{bg ? "Свържи се с нас" : "Contact us"}</Link> : null}
      </div>
    </main>
  );
}
