import { logServerError } from "@/lib/observability";

/** Fail loudly on data outages instead of presenting them as empty or missing data. */
export function throwLoadError(event: string, error: { message?: string } | null | undefined): never {
  logServerError(event, { message: error?.message ?? "unknown" });
  throw new Error(event);
}
