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
  const [language, session] = await Promise.all([getLanguage(), getCurrentSession()]);
  const copy = t(language);

  let navItems: { href: string; label: string }[] = [];

  if (session.isAdmin) {
    navItems = [
      { href: "/admin", label: copy.nav.adminHome },
      { href: "/admin/teachers", label: copy.nav.adminRoles },
      { href: "/admin/reviews", label: copy.nav.adminReviews }
    ];
  } else if (session.isTeacher) {
    navItems = [
      { href: "/teacher", label: copy.nav.teacherClasses },
      { href: "/teacher/assessments", label: copy.nav.teacherAssessments },
      { href: "/teacher/reviews", label: copy.nav.teacherReviews },
      { href: "/courses", label: copy.nav.teacherContent }
    ];
  } else if (session.user) {
    navItems = [
      { href: "/dashboard", label: copy.nav.today },
      { href: "/paths", label: copy.nav.myLearning },
      { href: "/courses", label: copy.nav.labs },
      { href: "/assessments", label: copy.nav.assessments },
      { href: "/classes", label: copy.nav.classes },
      { href: "/profile", label: copy.nav.profile }
    ];
  } else {
    navItems = [
      { href: "/", label: copy.nav.home },
      { href: "/paths", label: copy.nav.directions }
    ];
  }

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
        />
        {children}
      </body>
    </html>
  );
}
