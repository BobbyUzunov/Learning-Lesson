export class DataUnavailableError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "DataUnavailableError";
    this.code = code;
  }
}

export function isDataUnavailableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { name?: string; message?: string; code?: string };
  if (candidate.name === "DataUnavailableError") {
    return true;
  }
  if (typeof candidate.code === "string" && candidate.code.includes("_unavailable")) {
    return true;
  }
  if (typeof candidate.message === "string" && candidate.message.includes("_unavailable")) {
    return true;
  }
  return false;
}
