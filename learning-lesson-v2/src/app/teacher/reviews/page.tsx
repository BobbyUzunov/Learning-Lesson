import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { getTeacherClassrooms } from "@/lib/supabase/classrooms";
import { getClassroomAssignments } from "@/lib/supabase/assignments";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function TeacherReviewsPage() {
  const language = await getLanguage();
  const copy = t(language);
  const classrooms = await getTeacherClassrooms();
  const assignmentGroups = await Promise.all(
    classrooms.map(async (classroom) => ({
      classroom,
      assignments: await getClassroomAssignments(classroom.id)
    }))
  );

  const supabase = await createClient();
  const pending: {
    classroomId: string;
    classroomName: string;
    assignmentId: string;
    title: string;
    count: number;
  }[] = [];

  for (const group of assignmentGroups) {
    for (const assignment of group.assignments) {
      const { count } = await supabase
        .from("assignment_submissions")
        .select("id", { count: "exact", head: true })
        .eq("assignment_id", assignment.id)
        .eq("status", "submitted");

      if ((count ?? 0) > 0) {
        pending.push({
          classroomId: group.classroom.id,
          classroomName: group.classroom.name,
          assignmentId: assignment.id,
          title:
            language === "bg"
              ? assignment.missionTitleBg || assignment.missionTitle || assignment.missionId
              : assignment.missionTitle || assignment.missionId,
          count: count ?? 0
        });
      }
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-black">{copy.teacher.reviewsTitle}</h1>
      <p className="mt-2 text-ink/70">{copy.teacher.reviewsSubtitle}</p>

      {pending.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-ink/20 bg-white/60 p-6 text-sm text-ink/60">
          {copy.teacher.reviewsEmpty}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {pending.map((item) => (
            <li className="rounded-lg border border-ink/10 bg-white/80 p-4 shadow-soft" key={item.assignmentId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-violet">
                    <ClipboardCheck className="size-4" />
                    {item.classroomName}
                  </p>
                  <p className="mt-2 font-bold">{item.title}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {item.count} {copy.teacher.reviewsPending}
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper"
                  href={`/teacher/classes/${item.classroomId}/assignments/${item.assignmentId}`}
                >
                  {copy.teacher.openAssignment}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
