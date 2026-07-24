import { createClient } from "./server";
import { getCurrentSession } from "./auth";
import {
  mapClassroomReportRow,
  mapClassroomRow,
  type Classroom,
  type ClassroomReportRow,
  type ClassroomReportRpcRow,
  type ClassroomRow,
  type StudentClassroom
} from "@/lib/classrooms/types";

type ClassroomWithCountRow = ClassroomRow & {
  classroom_members: { count: number }[] | null;
};

const classroomColumns = "id, teacher_id, name, description, specialty_id, grade_level, join_code, archived, created_at";

export async function getTeacherClassrooms(): Promise<Classroom[]> {
  const session = await getCurrentSession();
  if (!session.user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classrooms")
    .select(`${classroomColumns}, classroom_members(count)`)
    .eq("teacher_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ClassroomWithCountRow[]).map((row) =>
    mapClassroomRow(row, row.classroom_members?.[0]?.count ?? 0)
  );
}

export async function getClassroomById(id: string): Promise<Classroom | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classrooms")
    .select(`${classroomColumns}, classroom_members(count)`)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ClassroomWithCountRow;
  return mapClassroomRow(row, row.classroom_members?.[0]?.count ?? 0);
}

export async function getClassroomReport(id: string): Promise<ClassroomReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_classroom_report", { p_classroom_id: id });

  if (error || !data) {
    return [];
  }

  return (data as ClassroomReportRpcRow[]).map(mapClassroomReportRow);
}

export async function getStudentClassrooms(): Promise<StudentClassroom[]> {
  const session = await getCurrentSession();
  if (!session.user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_members")
    .select("joined_at, classrooms(id, name, description, grade_level)")
    .eq("student_id", session.user.id)
    .order("joined_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  type MembershipRow = {
    joined_at: string;
    classrooms: {
      id: string;
      name: string;
      description: string | null;
      grade_level: number;
    } | null;
  };

  return (data as unknown as MembershipRow[])
    .filter((row): row is MembershipRow & { classrooms: NonNullable<MembershipRow["classrooms"]> } =>
      Boolean(row.classrooms)
    )
    .map((row) => ({
      id: row.classrooms.id,
      name: row.classrooms.name,
      description: row.classrooms.description,
      gradeLevel: row.classrooms.grade_level,
      joinedAt: row.joined_at
    }));
}
