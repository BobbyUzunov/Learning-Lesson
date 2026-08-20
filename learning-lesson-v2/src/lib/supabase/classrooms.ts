import { createClient } from "./server";
import { getCurrentSession } from "./auth";
import { hasSupabaseDataEnv } from "./data-env";
import { throwLoadError } from "./load-error";
import { getKnownErrorCode } from "@/lib/http";
import {
  mapClassroomReportRow,
  mapClassroomRow,
  type Classroom,
  type ClassroomReportRow,
  type ClassroomReportRpcRow,
  type ClassroomRow,
  type ClassroomStatus,
  type ClassroomTeacher,
  type ClassroomTeacherRole,
  type StudentClassroom
} from "@/lib/classrooms/types";
import type { ClassroomLabCompletion } from "@/lib/classrooms/lab-progress";

type ClassroomWithCountRow = ClassroomRow & {
  classroom_members: { count: number }[] | null;
};

type TransferCandidateRpcRow = { id: string; label: string };

type ClassroomTeacherRpcRow = {
  user_id: string;
  role: ClassroomTeacherRole;
  label: string;
};

type TeacherClassroomRpcRow = ClassroomRow & {
  member_count: number;
};

const classroomColumnsWithoutJoinCode =
  "id, teacher_id, name, description, specialty_id, grade_level, academic_year, status, join_code_enabled, created_at";

export async function getTeacherClassrooms(): Promise<Classroom[]> {
  const session = await getCurrentSession();
  if (!session.user || !hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_teacher_classrooms");

  if (error) {
    throwLoadError("teacher_classrooms_unavailable", error);
  }

  return ((data ?? []) as TeacherClassroomRpcRow[]).map((row) => mapClassroomRow(row, row.member_count ?? 0));
}

export async function getClassroomById(id: string): Promise<Classroom | null> {
  if (!hasSupabaseDataEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_teacher_classroom", { p_classroom_id: id }).maybeSingle();

  if (error) {
    if (getKnownErrorCode(error.message, ["not_authorized"])) {
      return null;
    }
    throwLoadError("teacher_classroom_unavailable", error);
  }

  if (data) {
    const row = data as TeacherClassroomRpcRow;
    return mapClassroomRow(row, row.member_count ?? 0);
  }

  // Fallback without join code for non-teacher authorized readers (should be rare).
  const { data: fallback, error: fallbackError } = await supabase
    .from("classrooms")
    .select(`${classroomColumnsWithoutJoinCode}, classroom_members(count)`)
    .eq("id", id)
    .maybeSingle();

  if (fallbackError) {
    throwLoadError("classroom_fallback_unavailable", fallbackError);
  }

  if (!fallback) {
    return null;
  }

  const row = fallback as Omit<ClassroomWithCountRow, "join_code"> & {
    join_code?: string | null;
    classroom_members: { count: number }[] | null;
  };

  return mapClassroomRow(
    {
      ...row,
      join_code: row.join_code ?? ""
    } as ClassroomWithCountRow,
    row.classroom_members?.[0]?.count ?? 0
  );
}

export async function getClassroomReport(id: string): Promise<ClassroomReportRow[]> {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_classroom_report", { p_classroom_id: id });

  if (error) {
    throwLoadError("teacher_classroom_report_unavailable", error);
  }

  return ((data ?? []) as ClassroomReportRpcRow[]).map(mapClassroomReportRow);
}

type ClassroomLabProgressRpcRow = {
  student_id: string;
  lesson_id: string;
  xp_earned: number;
  completed_at: string | null;
};

export async function getClassroomLabProgress(id: string): Promise<ClassroomLabCompletion[]> {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_classroom_lab_progress", { p_classroom_id: id });

  if (error) {
    throwLoadError("teacher_classroom_lab_progress_unavailable", error);
  }

  return ((data ?? []) as ClassroomLabProgressRpcRow[]).map((row) => ({
    studentId: row.student_id,
    lessonId: row.lesson_id,
    xpEarned: row.xp_earned,
    completedAt: row.completed_at
  }));
}

export async function getStudentClassrooms(): Promise<StudentClassroom[]> {
  const session = await getCurrentSession();
  if (!session.user || !hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_members")
    .select("joined_at, classrooms(id, name, description, specialty_id, grade_level, academic_year, status)")
    .eq("student_id", session.user.id)
    .order("joined_at", { ascending: false });

  if (error) {
    throwLoadError("student_classrooms_unavailable", error);
  }

  type MembershipRow = {
    joined_at: string;
    classrooms: {
      id: string;
      name: string;
      description: string | null;
      specialty_id: string | null;
      grade_level: number;
      academic_year: string;
      status: ClassroomStatus;
    } | null;
  };

  return ((data ?? []) as unknown as MembershipRow[])
    .filter((row): row is MembershipRow & { classrooms: NonNullable<MembershipRow["classrooms"]> } =>
      Boolean(row.classrooms)
    )
    .map((row) => ({
      id: row.classrooms.id,
      name: row.classrooms.name,
      description: row.classrooms.description,
      specialtyId: row.classrooms.specialty_id,
      gradeLevel: row.classrooms.grade_level,
      academicYear: row.classrooms.academic_year,
      status: row.classrooms.status,
      joinedAt: row.joined_at
    }));
}

export async function listTransferCandidates(classroomId: string) {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("list_classroom_transfer_candidates", { p_classroom_id: classroomId });

  if (error) {
    throwLoadError("classroom_transfer_candidates_unavailable", error);
  }

  return ((data ?? []) as TransferCandidateRpcRow[]).map((row) => ({ id: row.id, label: row.label }));
}

export async function listClassroomTeachers(classroomId: string): Promise<ClassroomTeacher[]> {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_classroom_teachers", {
    p_classroom_id: classroomId
  });

  if (error) {
    throwLoadError("classroom_teachers_unavailable", error);
  }

  return ((data ?? []) as ClassroomTeacherRpcRow[]).map((row) => ({
    userId: row.user_id,
    role: row.role,
    label: row.label
  }));
}

export async function listCoTeacherCandidates(classroomId: string) {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_classroom_co_teacher_candidates", {
    p_classroom_id: classroomId
  });

  if (error) {
    throwLoadError("classroom_co_teacher_candidates_unavailable", error);
  }

  return ((data ?? []) as TransferCandidateRpcRow[]).map((row) => ({ id: row.id, label: row.label }));
}
