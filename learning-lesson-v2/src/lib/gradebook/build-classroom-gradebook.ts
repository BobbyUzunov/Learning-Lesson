import type { Assessment, AssessmentReportRow } from "@/lib/assessments/types";
import type { AssignmentReportRow, ClassroomAssignment } from "@/lib/assignments/types";
import { shortStudentId, type ClassroomReportRow } from "@/lib/classrooms/types";
import type { Language } from "@/lib/language";
import type { ClassroomGradebook, GradebookCell, GradebookStatusLabels } from "./types";

function studentName(row: ClassroomReportRow) {
  return row.rosterName?.trim() || row.displayName?.trim() || shortStudentId(row.studentId);
}

function assignmentTitle(assignment: ClassroomAssignment, language: Language) {
  if (language === "bg") {
    return assignment.titleOverride || assignment.missionTitleBg || assignment.missionTitle || assignment.missionId;
  }

  return assignment.titleOverride || assignment.missionTitle || assignment.missionId;
}

function assignmentCell(row: AssignmentReportRow | undefined, labels: GradebookStatusLabels): GradebookCell {
  const status = row?.status ?? "missing";

  if (status === "approved") {
    return { label: labels.approved, tone: "ok" };
  }
  if (status === "submitted") {
    return { label: labels.submitted, tone: "warn" };
  }
  if (status === "needs_changes") {
    return { label: labels.needsChanges, tone: "warn" };
  }
  if (status === "draft") {
    return { label: labels.draft, tone: "missing" };
  }

  return { label: labels.missing, tone: "missing" };
}

function assessmentCell(row: AssessmentReportRow | undefined, labels: GradebookStatusLabels): GradebookCell {
  if (!row || row.status !== "submitted" || row.percentage === null) {
    return { label: labels.missing, tone: "missing" };
  }

  return { label: `${row.percentage}%`, tone: "ok" };
}

export function buildClassroomGradebook({
  classroomId,
  students,
  assignments,
  assessments,
  assignmentReports,
  assessmentReports,
  language,
  labels
}: {
  classroomId: string;
  students: ClassroomReportRow[];
  assignments: ClassroomAssignment[];
  assessments: Assessment[];
  assignmentReports: Record<string, AssignmentReportRow[]>;
  assessmentReports: Record<string, AssessmentReportRow[]>;
  language: Language;
  labels: GradebookStatusLabels;
}): ClassroomGradebook {
  const columns = [
    ...assignments.map((assignment) => ({
      id: `assignment:${assignment.id}`,
      kind: "assignment" as const,
      label: assignmentTitle(assignment, language),
      href: `/teacher/classes/${classroomId}/assignments/${assignment.id}`
    })),
    ...assessments.map((assessment) => ({
      id: `assessment:${assessment.id}`,
      kind: "assessment" as const,
      label: assessment.title,
      href: `/teacher/classes/${classroomId}/assessments/${assessment.id}`
    }))
  ];

  const assignmentByStudent = new Map(
    assignments.map((assignment) => [
      assignment.id,
      new Map((assignmentReports[assignment.id] ?? []).map((row) => [row.studentId, row]))
    ])
  );
  const assessmentByStudent = new Map(
    assessments.map((assessment) => [
      assessment.id,
      new Map((assessmentReports[assessment.id] ?? []).map((row) => [row.studentId, row]))
    ])
  );

  const rows = [...students]
    .sort((left, right) => studentName(left).localeCompare(studentName(right), language === "bg" ? "bg" : "en"))
    .map((student) => ({
      studentId: student.studentId,
      name: studentName(student),
      xp: student.xp,
      completedLessons: student.completedLessons,
      cells: Object.fromEntries(
        columns.map((column) => {
          if (column.kind === "assignment") {
            const assignmentId = column.id.slice("assignment:".length);
            return [column.id, assignmentCell(assignmentByStudent.get(assignmentId)?.get(student.studentId), labels)];
          }

          const assessmentId = column.id.slice("assessment:".length);
          return [column.id, assessmentCell(assessmentByStudent.get(assessmentId)?.get(student.studentId), labels)];
        })
      )
    }));

  return { columns, rows };
}
