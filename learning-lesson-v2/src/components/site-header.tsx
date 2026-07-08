"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import type { Language } from "@/lib/i18n";

type NavItem = {
  href: string;
  label: string;
};

export function SiteHeader({
  brand,
  isAuthenticated,
  language,
  loginLabel,
  logoutLabel,
  menuLabel,
  closeMenuLabel,
  navItems,
  registerLabel
}: {
  brand: string;
  isAuthenticated: boolean;
  language: Language;
  loginLabel: string;
  logoutLabel: string;
  menuLabel: string;
  closeMenuLabel: string;
  navItems: NavItem[];
  registerLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("mobile-menu-open");
      return;
    }

    document.body.classList.add("mobile-menu-open");
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          className="flex min-w-0 flex-1 items-center gap-2 font-bold tracking-normal"
          href="/"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-ink text-sm text-paper">LL</span>
          <span className="truncate">{brand}</span>
        </Link>

        <div className="hidden items-center gap-1 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-md px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher language={language} />
          {isAuthenticated ? (
            <LogoutButton label={logoutLabel} />
          ) : (
            <>
              <Link className="rounded-md px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink" href="/login">
                {loginLabel}
              </Link>
              <Link className="rounded-md bg-ink px-3 py-2 text-paper transition hover:bg-ink/90" href="/register">
                {registerLabel}
              </Link>
            </>
          )}
        </div>

        <button
          aria-expanded={open}
          aria-label={open ? closeMenuLabel : menuLabel}
          className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-ink/10 md:hidden"
          data-testid="mobile-menu-button"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open ? (
        <div className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-ink/10 bg-paper px-4 py-4 md:hidden" data-testid="mobile-menu-panel">
          <div className="grid gap-2 text-sm font-bold">
            {navItems.map((item) => (
              <Link
                className="inline-flex min-h-11 items-center rounded-md px-3 py-3 text-ink/80 transition hover:bg-ink/5 hover:text-ink"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <LanguageSwitcher language={language} />
            </div>
            {isAuthenticated ? (
              <LogoutButton className="mt-2 w-full min-h-11 justify-center" label={logoutLabel} />
            ) : (
              <div className="grid gap-2 pt-2">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 px-3 py-3 text-center"
                  href="/login"
                  onClick={() => setOpen(false)}
                >
                  {loginLabel}
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-3 py-3 text-center text-paper"
                  href="/register"
                  onClick={() => setOpen(false)}
                >
                  {registerLabel}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
