import type { Metadata } from "next";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Lesson v2",
  description: "A scalable learning platform with paths, lessons, XP, and progress."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getLanguage();
  const copy = t(language);
  const navItems = [
    { href: "/dashboard", label: copy.nav.dashboard },
    { href: "/paths", label: copy.nav.paths },
    { href: "/admin", label: copy.nav.admin }
  ];

  return (
    <html lang={language}>
      <body>
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-normal">
              <span className="grid size-9 place-items-center rounded-md bg-ink text-sm text-paper">LL</span>
              <span>Learning Lesson</span>
            </Link>
            <div className="flex items-center gap-1 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <LanguageSwitcher language={language} />
              <Link className="rounded-md bg-ink px-3 py-2 text-paper transition hover:bg-ink/90" href="/login">
                {copy.nav.login}
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
