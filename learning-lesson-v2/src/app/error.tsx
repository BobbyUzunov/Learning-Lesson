"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/route-error";
import { t, type Language } from "@/lib/i18n";

function getLanguageFromDocument(): Language {
  if (typeof document !== "undefined" && document.documentElement.lang === "bg") {
    return "bg";
  }

  return "en";
}

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const language = getLanguageFromDocument();
  const copy = t(language);
  const dataUnavailable = error.message.includes("_unavailable");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={language}>
      <body>
        <RouteError
          homeLabel={copy.common.home}
          message={dataUnavailable ? copy.common.temporarilyUnavailableMessage : copy.common.errorMessage}
          reset={reset}
          title={dataUnavailable ? copy.common.temporarilyUnavailableTitle : copy.common.errorTitle}
          tryAgainLabel={copy.common.tryAgain}
        />
      </body>
    </html>
  );
}
