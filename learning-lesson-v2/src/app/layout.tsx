import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
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
  const session = await getCurrentSession();
  const navItems = session.user
    ? [
        { href: "/dashboard", label: copy.nav.dashboard },
        { href: "/paths", label: copy.nav.paths },
        { href: "/profile", label: copy.nav.profile },
        ...(session.isAdmin ? [{ href: "/admin", label: copy.nav.admin }] : [])
      ]
    : [{ href: "/paths", label: copy.nav.paths }];

  return (
    <html lang={language}>
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
