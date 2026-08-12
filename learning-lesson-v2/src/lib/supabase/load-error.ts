import { logServerError } from "@/lib/observability";

/** Fail loudly on hub data outages instead of returning an empty list. */
export function throwLoadError(event: string, error: { message?: string } | null | undefined): never {
  logServerError(event, { message: error?.message ?? "unknown" });
  throw new Error(event);
}
