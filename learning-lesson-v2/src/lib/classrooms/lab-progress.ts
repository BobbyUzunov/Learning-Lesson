import type { ClassroomReportRow } from "./types";
import { shortStudentId } from "./types";
import type { GameQuest } from "@/lib/game-data";
import type { Language } from "@/lib/language";
import { localizeGameQuest } from "@/lib/i18n";

export type ClassroomLabCompletion = {
  studentId: string;
  lessonId: string;
  xpEarned: number;
  completedAt: string | null;
};

export type LabCourseStatus = "not_started" | "started" | "complete";

export type ClassroomLabCourseColumn = {
  id: string;
  title: string;
  totalLessons: number;
};

export type ClassroomLabCourseCell = {
  completed: number;
  total: number;
  percent: number;
  status: LabCourseStatus;
};

export type ClassroomLabProgressRow = {
  studentId: string;
  name: string;
  lastLabAt: string | null;
  strongest: { courseId: string; title: string; percent: number } | null;
  cells: Record<string, ClassroomLabCourseCell>;
};

export type ClassroomLabProgressSummary = {
  studentCount: number;
  startedCount: number;
  completedCourseCount: number;
  averageStrongestPercent: number;
};

export type ClassroomLabProgress = {
  courses: ClassroomLabCourseColumn[];
  rows: ClassroomLabProgressRow[];
  summary: ClassroomLabProgressSummary;
};

function studentName(row: ClassroomReportRow) {
  return row.rosterName?.trim() || row.displayName?.trim() || shortStudentId(row.studentId);
}

function courseStatus(completed: number, total: number): LabCourseStatus {
  if (total === 0 || completed <= 0) {
    return "not_started";
  }
  if (completed >= total) {
    return "complete";
  }
  return "started";
}

function csvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function buildClassroomLabProgress({
  students,
  courses,
  completions,
  language
}: {
  students: ClassroomReportRow[];
  courses: GameQuest[];
  completions: ClassroomLabCompletion[];
  language: Language;
}): ClassroomLabProgress {
  const columns: ClassroomLabCourseColumn[] = courses.map((course) => {
    const localized = localizeGameQuest(course, language);
    return {
      id: course.id,
      title: localized.title,
      totalLessons: course.lessonIds.length
    };
  });

  const lessonsByStudent = new Map<string, Set<string>>();
  const lastLabByStudent = new Map<string, string>();

  for (const completion of completions) {
    const lessons = lessonsByStudent.get(completion.studentId) ?? new Set<string>();
    lessons.add(completion.lessonId);
    lessonsByStudent.set(completion.studentId, lessons);

    if (!completion.completedAt) {
      continue;
    }
    const current = lastLabByStudent.get(completion.studentId);
    if (!current || completion.completedAt > current) {
      lastLabByStudent.set(completion.studentId, completion.completedAt);
    }
  }

  const rows = students.map((student) => {
    const completedIds = lessonsByStudent.get(student.studentId) ?? new Set<string>();
    const cells: Record<string, ClassroomLabCourseCell> = {};
    let strongest: ClassroomLabProgressRow["strongest"] = null;

    for (const course of courses) {
      const completed = course.lessonIds.filter((lessonId) => completedIds.has(lessonId)).length;
      const total = course.lessonIds.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const status = courseStatus(completed, total);
      cells[course.id] = { completed, total, percent, status };

      if (status === "not_started") {
        continue;
      }

      if (!strongest || percent > strongest.percent) {
        strongest = {
          courseId: course.id,
          title: columns.find((column) => column.id === course.id)?.title ?? course.id,
          percent
        };
      }
    }

    return {
      studentId: student.studentId,
      name: studentName(student),
      lastLabAt: lastLabByStudent.get(student.studentId) ?? null,
      strongest,
      cells
    };
  });

  const startedRows = rows.filter((row) => row.strongest);
  const completedCourseCount = rows.reduce(
    (sum, row) => sum + columns.filter((course) => row.cells[course.id]?.status === "complete").length,
    0
  );
  const averageStrongestPercent =
    startedRows.length === 0
      ? 0
      : Math.round(
          startedRows.reduce((sum, row) => sum + (row.strongest?.percent ?? 0), 0) / startedRows.length
        );

  return {
    courses: columns,
    rows,
    summary: {
      studentCount: rows.length,
      startedCount: startedRows.length,
      completedCourseCount,
      averageStrongestPercent
    }
  };
}

export function classroomLabProgressToCsv({
  progress,
  studentHeader,
  strongestHeader,
  lastActivityHeader,
  completeLabel,
  notStartedLabel
}: {
  progress: ClassroomLabProgress;
  studentHeader: string;
  strongestHeader: string;
  lastActivityHeader: string;
  completeLabel: string;
  notStartedLabel: string;
}) {
  const headers = [
    studentHeader,
    strongestHeader,
    ...progress.courses.map((course) => course.title),
    lastActivityHeader
  ];
  const lines = [
    headers.map(csvCell).join(","),
    ...progress.rows.map((row) =>
      [
        row.name,
        row.strongest ? `${row.strongest.title} ${row.strongest.percent}%` : notStartedLabel,
        ...progress.courses.map((course) => {
          const cell = row.cells[course.id];
          if (!cell || cell.status === "not_started") {
            return notStartedLabel;
          }
          if (cell.status === "complete") {
            return `${completeLabel} ${cell.completed}/${cell.total}`;
          }
          return `${cell.completed}/${cell.total} (${cell.percent}%)`;
        }),
        row.lastLabAt ?? ""
      ]
        .map(csvCell)
        .join(",")
    )
  ];

  return `\uFEFF${lines.join("\n")}`;
}

export function labProgressCsvFilename(className: string) {
  const safe = className.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "class";
  return `labs-${safe}.csv`;
}
