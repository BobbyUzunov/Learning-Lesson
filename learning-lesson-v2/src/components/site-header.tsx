"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import type { Language } from "@/lib/language";

type NavItem = {
  href: string;
  label: string;
};

const roleBadgeStyles = {
  teacher: "border-mint/35 bg-mint/15 text-ink",
  admin: "border-violet/30 bg-violet/10 text-ink",
  student: "border-mint/35 bg-mint/15 text-ink"
} as const;

export function SiteHeader({
  brand,
  brandHref = "/",
  isAuthenticated,
  language,
  loginLabel,
  logoutLabel,
  menuLabel,
  closeMenuLabel,
  navItems,
  roleLabel,
  role = null
}: {
  brand: string;
  brandHref?: string;
  isAuthenticated: boolean;
  language: Language;
  loginLabel: string;
  logoutLabel: string;
  menuLabel: string;
  closeMenuLabel: string;
  navItems: NavItem[];
  roleLabel?: string | null;
  role?: "teacher" | "admin" | "student" | null;
}) {
  const [open, setOpen] = useState(false);
  const badgeTone = role ? roleBadgeStyles[role] : "border-ink/15 bg-ink/5 text-ink/75";

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("mobile-menu-open");
      return;
    }

    document.body.classList.add("mobile-menu-open");
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  const authControl = isAuthenticated ? (
    <LogoutButton label={logoutLabel} />
  ) : (
    <Link
      className="focus-ring inline-flex h-9 items-center rounded-lg bg-ink px-3 text-sm font-semibold text-paper transition hover:bg-ink/90"
      href="/login"
      onClick={() => setOpen(false)}
    >
      {loginLabel}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <Link
            className="flex min-w-0 items-center gap-2 font-bold tracking-normal"
            href={brandHref}
            onClick={() => setOpen(false)}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-ink text-sm text-paper">LL</span>
            <span className="truncate">{brand}</span>
          </Link>
          {roleLabel ? (
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none tracking-wide sm:text-xs ${badgeTone}`}
              data-testid="header-role-badge"
            >
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${
                  role === "teacher" || role === "student"
                    ? "bg-mint"
                    : role === "admin"
                      ? "bg-violet"
                      : "bg-ink/40"
                }`}
              />
              {roleLabel}
            </span>
          ) : null}
        </div>

        <div className="hidden items-center md:flex">
          <div className="flex items-center gap-0.5 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                className="rounded-lg px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                href={item.href}
                key={`${item.href}-${item.label}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-3 flex items-center gap-2 border-l border-ink/10 pl-3">
            <LanguageSwitcher language={language} />
            {authControl}
          </div>
        </div>

        <button
          aria-expanded={open}
          aria-label={open ? closeMenuLabel : menuLabel}
          className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-ink/10 md:hidden"
          data-testid="mobile-menu-button"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open ? (
        <div
          className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-ink/10 bg-paper px-4 py-4 md:hidden"
          data-testid="mobile-menu-panel"
        >
          <div className="grid gap-1 text-sm font-bold">
            {navItems.map((item) => (
              <Link
                className="inline-flex min-h-11 items-center rounded-lg px-3 py-3 text-ink/80 transition hover:bg-ink/5 hover:text-ink"
                href={item.href}
                key={`${item.href}-${item.label}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-ink/10 pt-4">
            <LanguageSwitcher className="w-full min-w-0 flex-1" language={language} />
            <div className="shrink-0">
              {isAuthenticated ? (
                <LogoutButton label={logoutLabel} />
              ) : (
                <Link
                  className="focus-ring inline-flex h-9 items-center rounded-lg bg-ink px-3 text-sm font-semibold text-paper"
                  href="/login"
                  onClick={() => setOpen(false)}
                >
                  {loginLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
