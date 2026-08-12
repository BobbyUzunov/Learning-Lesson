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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const className =
    tone === "dark"
      ? "focus-ring inline-flex items-center gap-2 rounded-xl border border-paper/20 bg-paper/10 px-3.5 py-2.5 text-sm font-bold text-paper transition hover:bg-paper/15"
      : "focus-ring inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm font-bold text-ink transition hover:bg-ink/5";

  return (
    <button className={className} onClick={handleCopy} type="button">
      {copied ? <Check className={`size-4 ${tone === "dark" ? "text-mint" : "text-mint"}`} /> : <Copy className="size-4" />}
      {copied ? copy.teacher.copied : copy.teacher.copyCode}
    </button>
  );
}
