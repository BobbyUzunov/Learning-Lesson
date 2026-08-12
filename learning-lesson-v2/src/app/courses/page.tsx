import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CoursesPageProps = {
  searchParams: Promise<{ guestLocked?: string; lessonLocked?: string }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams({ tab: "labs" });
  if (params.guestLocked) {
    query.set("guestLocked", params.guestLocked);
  }
  if (params.lessonLocked) {
    query.set("lessonLocked", params.lessonLocked);
  }
  redirect(`/paths?${query.toString()}`);
}
