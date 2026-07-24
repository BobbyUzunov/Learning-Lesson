export type ClassroomStatus = "active" | "archived";

export type Classroom = {
  id: string;
  teacherId: string;
  name: string;
  description: string | null;
  specialtyId: string | null;
  gradeLevel: number;
  academicYear: string;
  status: ClassroomStatus;
  joinCode: string;
  joinCodeEnabled: boolean;
  createdAt: string;
  memberCount?: number;
};

export type StudentClassroom = {
  id: string;
  name: string;
  description: string | null;
  gradeLevel: number;
  academicYear: string;
  status: ClassroomStatus;
  joinedAt: string;
};

export type ClassroomReportRow = {
  studentId: string;
  displayName: string | null;
  completedLessons: number;
  xp: number;
  level: number;
  lastVisit: string | null;
  joinedAt: string;
};

export type ClassroomRow = {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  specialty_id: string | null;
  grade_level: number;
  academic_year: string;
  status: ClassroomStatus;
  join_code: string;
  join_code_enabled: boolean;
  created_at: string;
};

export type ClassroomReportRpcRow = {
  student_id: string;
  display_name: string | null;
  completed_lessons: number;
  xp: number;
  level: number;
  last_visit: string | null;
  joined_at: string;
};

export function shortStudentId(studentId: string) {
  return studentId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function mapClassroomRow(row: ClassroomRow, memberCount?: number): Classroom {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    description: row.description,
    specialtyId: row.specialty_id,
    gradeLevel: row.grade_level,
    academicYear: row.academic_year,
    status: row.status,
    joinCode: row.join_code,
    joinCodeEnabled: row.join_code_enabled,
    createdAt: row.created_at,
    memberCount
  };
}

export function mapClassroomReportRow(row: ClassroomReportRpcRow): ClassroomReportRow {
  return {
    studentId: row.student_id,
    displayName: row.display_name,
    completedLessons: row.completed_lessons,
    xp: row.xp,
    level: row.level,
    lastVisit: row.last_visit,
    joinedAt: row.joined_at
  };
}

export type ClassroomReportSummary = {
  studentCount: number;
  averageCompletedLessons: number;
  averageXp: number;
  activeToday: number;
};

export function summarizeClassroomReport(
  rows: ClassroomReportRow[],
  today: string
): ClassroomReportSummary {
  if (rows.length === 0) {
    return { studentCount: 0, averageCompletedLessons: 0, averageXp: 0, activeToday: 0 };
  }

  const totalLessons = rows.reduce((sum, row) => sum + row.completedLessons, 0);
  const totalXp = rows.reduce((sum, row) => sum + row.xp, 0);
  const activeToday = rows.filter((row) => row.lastVisit === today).length;

  return {
    studentCount: rows.length,
    averageCompletedLessons: Math.round((totalLessons / rows.length) * 10) / 10,
    averageXp: Math.round(totalXp / rows.length),
    activeToday
  };
}
