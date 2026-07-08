"use client";

import { useRouter } from "next/navigation";
import type { Language } from "@/lib/i18n";
import { languageCookie } from "@/lib/i18n";

export function LanguageSwitcher({ language }: { language: Language }) {
  const router = useRouter();

  function setLanguage(nextLanguage: Language) {
    document.cookie = `${languageCookie}=${nextLanguage}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 rounded-md bg-ink/10 p-1 text-sm font-bold" aria-label="Language">
      {(["bg", "en"] as const).map((item) => (
        <button
          className={`focus-ring min-h-11 rounded px-3 py-2 uppercase ${language === item ? "bg-white shadow-sm" : "text-ink/60"}`}
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
