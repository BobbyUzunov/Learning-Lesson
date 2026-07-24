import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import "./globals.css";

const displayFont = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap"
});

const bodyFont = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Learning Lesson",
  description:
    "Практическа образователна платформа за професионални гимназии — мисии, уроци и измерим напредък за ученици и учители."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getLanguage();
  const copy = t(language);
  const session = await getCurrentSession();
  const navItems = session.user
    ? [
        { href: "/dashboard", label: copy.nav.dashboard },
        { href: "/paths", label: copy.nav.paths },
        { href: "/classes", label: copy.nav.classes },
        { href: "/profile", label: copy.nav.profile },
        ...(session.isTeacher
          ? [{ href: "/teacher", label: copy.nav.teacher }]
          : [{ href: "/for-teachers", label: copy.nav.forTeachers }]),
        ...(session.isAdmin ? [{ href: "/admin", label: copy.nav.admin }] : [])
      ]
    : [
        { href: "/paths", label: copy.nav.paths },
        { href: "/for-teachers", label: copy.nav.forTeachers }
      ];

  return (
    <html className={`${displayFont.variable} ${bodyFont.variable}`} lang={language}>
      <body>
        <SiteHeader
          brand={copy.nav.brand}
          closeMenuLabel={copy.nav.closeMenu}
          isAuthenticated={Boolean(session.user)}
          language={language}
          loginLabel={copy.nav.login}
          logoutLabel={copy.nav.logout}
          menuLabel={copy.nav.openMenu}
          navItems={navItems}
          registerLabel={copy.nav.register}
        />
        {children}
      </body>
    </html>
  );
}
