"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

export function CopyCodeButton({ code, language }: { code: string; language: Language }) {
  const copy = t(language);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-sm font-bold text-ink transition hover:bg-ink/5"
      onClick={handleCopy}
      type="button"
    >
      {copied ? <Check className="size-4 text-mint" /> : <Copy className="size-4" />}
      {copied ? copy.teacher.copied : copy.teacher.copyCode}
    </button>
  );
}
