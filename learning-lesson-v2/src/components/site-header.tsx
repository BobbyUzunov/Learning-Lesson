"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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

let activeLocks = 0;
let lockedScrollY = 0;

function getSiteScroller() {
  return document.getElementById("site-scroll");
}

function lockScroll() {
  const html = document.documentElement;
  const body = document.body;
  const scroller = getSiteScroller();
  if (activeLocks === 0) {
    lockedScrollY = scroller?.scrollTop ?? window.scrollY;
    html.classList.add("mobile-menu-open");
    body.classList.add("mobile-menu-open");
    if (scroller) {
      scroller.dataset.scrollLocked = "1";
      scroller.style.overflow = "hidden";
    } else {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    }
  }
  activeLocks += 1;
}

function unlockScroll() {
  if (activeLocks === 0) {
    return;
  }
  activeLocks -= 1;
  if (activeLocks > 0) {
    return;
  }

  const html = document.documentElement;
  const body = document.body;
  const scroller = getSiteScroller();
  html.classList.remove("mobile-menu-open");
  body.classList.remove("mobile-menu-open");
  if (scroller) {
    scroller.style.removeProperty("overflow");
    delete scroller.dataset.scrollLocked;
    scroller.scrollTop = lockedScrollY;
  } else {
    html.style.removeProperty("overflow");
    body.style.removeProperty("overflow");
    window.scrollTo(0, lockedScrollY);
  }
}

export function SiteHeader({
  brand,
  brandHref = "/",
  isAuthenticated,
  language,
  loginLabel,
  registerLabel,
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
  registerLabel: string;
  logoutLabel: string;
  menuLabel: string;
  closeMenuLabel: string;
  navItems: NavItem[];
  roleLabel?: string | null;
  role?: "teacher" | "admin" | "student" | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const badgeTone = role ? roleBadgeStyles[role] : "border-ink/15 bg-ink/5 text-ink/75";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    function publishHeight() {
      const node = headerRef.current;
      if (!node) {
        return;
      }
      const height = node.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--site-header-height", `${Math.ceil(height)}px`);
    }

    publishHeight();
    const node = headerRef.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(publishHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, roleLabel]);

  useEffect(() => {
    if (!open) {
      unlockScroll();
      return;
    }

    lockScroll();

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const authControl = isAuthenticated ? (
    <LogoutButton label={logoutLabel} />
  ) : (
    <div className="flex items-center gap-2">
      <Link
        className="focus-ring inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink"
        href="/register"
        onClick={() => setOpen(false)}
      >
        {registerLabel}
      </Link>
      <Link
        className="focus-ring inline-flex h-9 items-center rounded-lg bg-ink px-3 text-sm font-semibold text-paper transition hover:bg-ink/90"
        href="/login"
        onClick={() => setOpen(false)}
      >
        {loginLabel}
      </Link>
    </div>
  );

  return (
    <>
      {open ? (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-ink/50 md:hidden"
          data-testid="mobile-menu-overlay"
          onPointerDown={() => setOpen(false)}
        />
      ) : null}
      <header
        className="z-50 shrink-0 border-b border-ink/10 bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur"
        data-testid="site-header"
        ref={headerRef}
      >
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
                className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none tracking-wide min-[380px]:inline-flex sm:text-xs ${badgeTone}`}
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
            aria-controls={panelId}
            aria-expanded={open}
            aria-label={open ? closeMenuLabel : menuLabel}
            className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-ink/10 md:hidden"
            data-testid="mobile-menu-button"
            onClick={() => setOpen((value) => !value)}
            ref={toggleRef}
            type="button"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {open ? (
          <div
            className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-ink/10 bg-paper px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] touch-pan-y md:hidden"
            data-testid="mobile-menu-panel"
            id={panelId}
            ref={panelRef}
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

            <div className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4">
              <LanguageSwitcher className="h-11 min-h-11 w-full" language={language} />
              {isAuthenticated ? (
                <LogoutButton className="h-11 w-full justify-center" label={logoutLabel} />
              ) : (
                <>
                  <Link
                    className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-ink"
                    href="/register"
                    onClick={() => setOpen(false)}
                  >
                    {registerLabel}
                  </Link>
                  <Link
                    className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-paper"
                    href="/login"
                    onClick={() => setOpen(false)}
                  >
                    {loginLabel}
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
