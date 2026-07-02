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

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={language}>
      <body>
        <RouteError
          homeLabel={copy.common.home}
          message={error.message || copy.common.errorTitle}
          reset={reset}
          title={copy.common.errorTitle}
          tryAgainLabel={copy.common.tryAgain}
        />
      </body>
    </html>
  );
}
