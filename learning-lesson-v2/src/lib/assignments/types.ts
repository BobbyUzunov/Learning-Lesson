export type AssignmentStatus = "draft" | "submitted" | "approved" | "needs_changes" | "missing";

export type ClassroomAssignment = {
  id: string;
  classroomId: string;
  missionId: string;
  assignedBy: string;
  titleOverride: string | null;
  instructions: string | null;
  dueAt: string | null;
  createdAt: string;
  missionTitle?: string;
  missionTitleBg?: string;
  missionBrief?: string;
  missionBriefBg?: string;
  missionDeliverable?: string;
  missionDeliverableBg?: string;
  estimatedMinutes?: number;
  submissionStatus?: AssignmentStatus | null;
  submissionId?: string | null;
  teacherNote?: string | null;
  submittedAt?: string | null;
  classroomName?: string;
};

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  status: AssignmentStatus;
  deliverableText: string | null;
  deliverableUrl: string | null;
  teacherNote: string | null;
  reviewedBy: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type AssignmentReportRow = {
  studentId: string;
  displayName: string | null;
  email: string | null;
  submissionId: string | null;
  status: AssignmentStatus;
  deliverableText: string | null;
  deliverableUrl: string | null;
  teacherNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  joinedAt: string;
};

export type ClassroomAssignmentRow = {
  id: string;
  classroom_id: string;
  mission_id: string;
  assigned_by: string;
  title_override: string | null;
  instructions: string | null;
  due_at: string | null;
  created_at: string;
};

export type AssignmentSubmissionRow = {
  id: string;
  assignment_id: string;
  student_id: string;
  status: AssignmentStatus;
  deliverable_text: string | null;
  deliverable_url: string | null;
  teacher_note: string | null;
  reviewed_by: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
};

export type AssignmentReportRpcRow = {
  student_id: string;
  display_name: string | null;
  email: string | null;
  submission_id: string | null;
  status: string;
  deliverable_text: string | null;
  deliverable_url: string | null;
  teacher_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  joined_at: string;
};

export function mapClassroomAssignmentRow(
  row: ClassroomAssignmentRow,
  extras?: Partial<ClassroomAssignment>
): ClassroomAssignment {
  return {
    id: row.id,
    classroomId: row.classroom_id,
    missionId: row.mission_id,
    assignedBy: row.assigned_by,
    titleOverride: row.title_override,
    instructions: row.instructions,
    dueAt: row.due_at,
    createdAt: row.created_at,
    ...extras
  };
}

export function mapAssignmentSubmissionRow(row: AssignmentSubmissionRow): AssignmentSubmission {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    studentId: row.student_id,
    status: row.status,
    deliverableText: row.deliverable_text,
    deliverableUrl: row.deliverable_url,
    teacherNote: row.teacher_note,
    reviewedBy: row.reviewed_by,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at
  };
}

function asAssignmentStatus(value: string): AssignmentStatus {
  if (
    value === "draft" ||
    value === "submitted" ||
    value === "approved" ||
    value === "needs_changes" ||
    value === "missing"
  ) {
    return value;
  }
  return "missing";
}

export function mapAssignmentReportRow(row: AssignmentReportRpcRow): AssignmentReportRow {
  return {
    studentId: row.student_id,
    displayName: row.display_name,
    email: row.email,
    submissionId: row.submission_id,
    status: asAssignmentStatus(row.status),
    deliverableText: row.deliverable_text,
    deliverableUrl: row.deliverable_url,
    teacherNote: row.teacher_note,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    joinedAt: row.joined_at
  };
}

export type AssignmentReportSummary = {
  studentCount: number;
  missing: number;
  submitted: number;
  approved: number;
  needsChanges: number;
};

export function summarizeAssignmentReport(rows: AssignmentReportRow[]): AssignmentReportSummary {
  return {
    studentCount: rows.length,
    missing: rows.filter((row) => row.status === "missing" || row.status === "draft").length,
    submitted: rows.filter((row) => row.status === "submitted").length,
    approved: rows.filter((row) => row.status === "approved").length,
    needsChanges: rows.filter((row) => row.status === "needs_changes").length
  };
}
