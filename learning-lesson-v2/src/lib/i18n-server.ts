import { cookies } from "next/headers";
import { languageCookie, type Language } from "./i18n";

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  return cookieStore.get(languageCookie)?.value === "en" ? "en" : "bg";
}
