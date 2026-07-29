import { cache } from "react";
import { cookies } from "next/headers";
import { languageCookie, type Language } from "./language";

async function readLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  return cookieStore.get(languageCookie)?.value === "en" ? "en" : "bg";
}

export const getLanguage = cache(readLanguage);
