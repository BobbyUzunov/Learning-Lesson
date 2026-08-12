"use client";

import { useRouter } from "next/navigation";
import { languageCookie, type Language } from "@/lib/language";

export function LanguageSwitcher({
  language,
  className = ""
}: {
  language: Language;
  className?: string;
}) {
  const router = useRouter();

  function setLanguage(nextLanguage: Language) {
    document.cookie = `${languageCookie}=${nextLanguage}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      aria-label="Language"
      className={`inline-grid h-9 grid-cols-2 items-stretch rounded-lg border border-ink/10 bg-ink/[0.04] p-0.5 text-xs font-bold ${className}`}
    >
      {(["bg", "en"] as const).map((item) => (
        <button
          className={`focus-ring rounded-md px-2.5 uppercase transition ${
            language === item ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink/70"
          }`}
          key={item}
          onClick={() => setLanguage(item)}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
