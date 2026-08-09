type LogFields = Record<string, string | number | boolean | null | undefined>;

/** Structured stderr logs for Vercel/runtime inspection. Never include secrets. */
export function logServerError(event: string, fields: LogFields = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      ...fields,
      at: new Date().toISOString()
    })
  );
}
