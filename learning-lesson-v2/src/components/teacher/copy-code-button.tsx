"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

export function CopyCodeButton({
  code,
  language,
  tone = "light"
}: {
  code: string;
  language: Language;
  tone?: "light" | "dark";
}) {
  const copy = t(language);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleCopy() {
    setPending(true);
    setCopied(false);
    setError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  const className =
    tone === "dark"
      ? "focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-paper/20 bg-paper/10 px-3.5 py-2.5 text-sm font-bold text-paper transition hover:bg-paper/15"
      : "focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm font-bold text-ink transition hover:bg-ink/5";

  return (
    <div>
      <button className={className} disabled={pending} onClick={handleCopy} type="button">
        {copied ? <Check className="size-4 text-mint" /> : <Copy className="size-4" />}
        {copied ? copy.teacher.copied : copy.teacher.copyCode}
      </button>
      <p aria-live="polite" className="sr-only">{copied ? copy.teacher.copied : null}</p>
      {error ? (
        <p role="alert" className="mt-2 max-w-sm text-sm">
          {language === "bg"
            ? "Кодът не беше копиран. Маркирай го и го копирай ръчно или опитай отново."
            : "Could not copy the code. Select and copy it manually or try again."}
        </p>
      ) : null}
    </div>
  );
}
