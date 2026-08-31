import Link from "next/link";
import { t, type Language } from "@/lib/i18n";

export function SiteFooter({ language }: { language: Language }) {
  const copy = t(language);

  return (
    <footer className="border-t border-ink/10 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
        <p>{copy.footer.rights}</p>
        <Link className="font-semibold text-ink/70 underline-offset-4 hover:text-ink hover:underline" href="/privacy">
          {copy.footer.privacy}
        </Link>
      </div>
    </footer>
  );
}
