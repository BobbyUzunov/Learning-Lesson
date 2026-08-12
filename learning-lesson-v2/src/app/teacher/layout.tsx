import { requireTeacher } from "@/lib/supabase/auth";

/** Auth gate only — primary teacher nav lives in the site header to avoid double menus. */
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireTeacher();

  return <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>;
}
