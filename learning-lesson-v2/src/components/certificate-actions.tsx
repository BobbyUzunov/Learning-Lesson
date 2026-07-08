"use client";

import { useState } from "react";
import { Link2, Printer } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

export function CertificateActions({ language }: { language: Language }) {
  const copy = t(language);
  const [copied, setCopied] = useState(false);

  function handlePrint() {
    window.print();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
      <button
        className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-paper transition hover:bg-ink/90 sm:w-auto"
        onClick={handlePrint}
        type="button"
      >
        <Printer className="size-4" />
        {copy.certificates.print}
      </button>
      <button
        className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 py-3 font-bold transition hover:bg-ink/5 sm:w-auto"
        onClick={handleCopyLink}
        type="button"
      >
        <Link2 className="size-4" />
        {copied ? copy.certificates.linkCopied : copy.certificates.copyLink}
      </button>
    </div>
  );
}
