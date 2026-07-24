export type Classroom = {
  id: string;
  teacherId: string;
  name: string;
  description: string | null;
  specialtyId: string | null;
  gradeLevel: number;
  joinCode: string;
  archived: boolean;
  createdAt: string;
  memberCount?: number;
};

export type StudentClassroom = {
  id: string;
  name: string;
  description: string | null;
  gradeLevel: number;
  joinedAt: string;
};

export type ClassroomReportRow = {
  studentId: string;
  displayName: string | null;
  email: string | null;
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
  join_code: string;
  archived: boolean;
  created_at: string;
};

export type ClassroomReportRpcRow = {
  student_id: string;
  display_name: string | null;
  email: string | null;
  completed_lessons: number;
  xp: number;
  level: number;
  last_visit: string | null;
  joined_at: string;
};

export function mapClassroomRow(row: ClassroomRow, memberCount?: number): Classroom {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    description: row.description,
    specialtyId: row.specialty_id,
    gradeLevel: row.grade_level,
    joinCode: row.join_code,
    archived: row.archived,
    createdAt: row.created_at,
    memberCount
  };
}

export function mapClassroomReportRow(row: ClassroomReportRpcRow): ClassroomReportRow {
  return {
    studentId: row.student_id,
    displayName: row.display_name,
    email: row.email,
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
