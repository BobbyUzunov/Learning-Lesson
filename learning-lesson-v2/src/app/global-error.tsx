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

/** Root-layout failures only — must render its own html/body. */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const language = getLanguageFromDocument();
  const copy = t(language);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={language}>
      <body>
        <RouteError
          homeLabel={copy.common.home}
          message={copy.common.temporarilyUnavailableMessage}
          reset={reset}
          title={copy.common.temporarilyUnavailableTitle}
          tryAgainLabel={copy.common.tryAgain}
        />
      </body>
    </html>
  );
}
