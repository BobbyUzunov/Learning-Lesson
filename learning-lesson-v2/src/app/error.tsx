"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/route-error";
import { isDataUnavailableError } from "@/lib/supabase/data-unavailable";
import { t, type Language } from "@/lib/i18n";

function getLanguageFromDocument(): Language {
  if (typeof document !== "undefined" && document.documentElement.lang === "bg") {
    return "bg";
  }

  return "en";
}

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const language = getLanguageFromDocument();
  const copy = t(language);
  // Production sanitizes Server Component error.message; digests still mark SC failures.
  const dataUnavailable = isDataUnavailableError(error) || Boolean(error.digest);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteError
      homeLabel={copy.common.home}
      message={dataUnavailable ? copy.common.temporarilyUnavailableMessage : copy.common.errorMessage}
      reset={reset}
      title={dataUnavailable ? copy.common.temporarilyUnavailableTitle : copy.common.errorTitle}
      tryAgainLabel={copy.common.tryAgain}
    />
  );
}
