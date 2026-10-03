import { vi } from "vitest";

/**
 * throwLoadError uses next/navigation redirect for production-safe outage UI.
 * In unit tests, surface the outage code as the thrown Error message so existing
 * rejects.toThrow("<event>_unavailable") assertions keep working.
 */
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    const match = /[?&]code=([^&]+)/.exec(url);
    const code = match ? decodeURIComponent(match[1]) : "NEXT_REDIRECT";
    throw new Error(code);
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams()
}));
