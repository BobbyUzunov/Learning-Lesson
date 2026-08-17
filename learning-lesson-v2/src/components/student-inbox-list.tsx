import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Language } from "@/lib/language";
import type { StudentInboxItem } from "@/lib/inbox/types";

function formatDue(value: string | null, language: Language) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function StudentInboxList({
  items,
  language,
  copy,
  openLabel
}: {
  items: StudentInboxItem[];
  language: Language;
  copy: ReturnType<typeof t>["inbox"];
  openLabel: string;
}) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
      {items.map((item, index) => {
        const due = formatDue(item.dueAt, language);

        return (
          <li
            className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
              index > 0 ? "border-t border-ink/8" : ""
            }`}
            key={item.id}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">{copy[item.kind]}</p>
              <p className="mt-0.5 font-semibold text-ink/85">{item.title}</p>
              <p className="mt-0.5 text-xs text-ink/45">
                {item.classroomName ? `${item.classroomName}` : ""}
                {item.classroomName && due ? " · " : ""}
                {due ? `${copy.dueLabel}: ${due}` : ""}
              </p>
              {item.note ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink/70">{item.note}</p> : null}
            </div>
            <Link
              className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-paper"
              href={item.href}
            >
              {openLabel}
              <ArrowRight className="size-4" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
