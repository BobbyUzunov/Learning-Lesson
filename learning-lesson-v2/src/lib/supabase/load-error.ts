import { redirect } from "next/navigation";
import { logServerError } from "@/lib/observability";

/**
 * Expected data outages must not rely on error.message in production error.tsx —
 * Next.js sanitizes Server Component errors. Redirect to a controlled unavailable UI.
 */
export function throwLoadError(event: string, error: { message?: string } | null | undefined): never {
  logServerError(event, { message: error?.message ?? "unknown" });
  redirect(`/unavailable?code=${encodeURIComponent(event)}`);
}
