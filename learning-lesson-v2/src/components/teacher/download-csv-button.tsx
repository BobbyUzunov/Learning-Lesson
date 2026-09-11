"use client";

import { useState } from "react";
import { t, type Language } from "@/lib/i18n";
import { ActionToast } from "@/components/action-toast";

export function DownloadCsvButton({
  csv,
  filename,
  label,
  language
}: {
  csv: string;
  filename: string;
  label: string;
  language: Language;
}) {
  const copy = t(language);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  function download() {
    setResult(null);
    let url: string | undefined;
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      try {
        link.click();
        setResult("success");
      } finally {
        link.remove();
      }
    } catch {
      setResult("error");
    } finally {
      if (url) {
        const downloadUrl = url;
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }
    }
  }

  return (
    <div>
      <button
        className="focus-ring inline-flex min-h-11 items-center rounded-xl bg-ink px-4 py-2 text-sm font-bold text-paper transition hover:bg-ink/90"
        onClick={download}
        type="button"
      >
        {label}
      </button>
      {result ? (
        <ActionToast
          message={
            result === "success"
              ? language === "bg" ? "Изтеглянето на CSV започна." : "CSV download started."
              : language === "bg" ? "CSV файлът не беше изтеглен. Опитай отново." : "Could not download the CSV file. Try again."
          }
          onDismiss={() => setResult(null)}
          closeLabel={copy.common.close}
          tone={result}
        />
      ) : null}
    </div>
  );
}
