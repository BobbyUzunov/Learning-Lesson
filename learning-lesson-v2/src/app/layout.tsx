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
  let brandHref = "/";
  let roleLabel: string | null = null;
  let role: "teacher" | "admin" | "student" | null = null;

  if (session.isAdmin) {
    brandHref = "/admin";
    role = "admin";
    roleLabel = copy.nav.roleAdmin;
    navItems = [
      { href: "/admin", label: copy.nav.adminHome },
      { href: "/admin/reviews", label: copy.nav.adminReviews },
      { href: "/admin/teachers", label: copy.nav.adminRoles }
    ];
  } else if (session.isTeacher) {
    brandHref = "/teacher";
    role = "teacher";
    roleLabel = copy.nav.roleTeacher;
    navItems = [
      { href: "/teacher", label: copy.nav.teacherHome },
      { href: "/teacher/classes", label: copy.nav.teacherClasses },
      { href: "/teacher/reviews", label: copy.nav.teacherReviews },
      { href: "/teacher/assessments", label: copy.nav.teacherAssessments }
    ];
  } else if (session.user) {
    brandHref = "/dashboard";
    role = "student";
    roleLabel = copy.nav.roleStudent;
    navItems = [
      { href: "/dashboard", label: copy.nav.today },
      { href: "/inbox", label: copy.nav.inbox },
      { href: "/paths", label: copy.nav.learning },
      { href: "/classes", label: copy.nav.classHub }
    ];
  } else {
    navItems = [
      { href: "/", label: copy.nav.home },
      { href: "/for-teachers", label: copy.nav.forTeachers }
    ];
  }

  return (
    <html className={`${displayFont.variable} ${bodyFont.variable}`} lang={language}>
      <body>
        <SiteHeader
          brand={copy.nav.brand}
          brandHref={brandHref}
          closeMenuLabel={copy.nav.closeMenu}
          isAuthenticated={Boolean(session.user)}
          language={language}
          loginLabel={copy.nav.login}
          logoutLabel={copy.nav.logout}
          menuLabel={copy.nav.openMenu}
          navItems={navItems}
          role={role}
          roleLabel={roleLabel}
        />
        {children}
      </body>
    </html>
  );
}
