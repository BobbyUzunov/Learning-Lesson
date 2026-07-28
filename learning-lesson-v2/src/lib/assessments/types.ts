export type AssessmentType = "diagnostic" | "formative" | "summative";
export type AssessmentStatus = "published" | "closed";

export type Assessment = {
  id: string;
  classroomId: string;
  createdBy: string;
  title: string;
  description: string | null;
  type: AssessmentType;
  status: AssessmentStatus;
  dueAt: string | null;
  durationMinutes: number | null;
  createdAt: string;
  classroomName?: string;
  questionCount?: number;
  submissionCount?: number;
  attempt?: AssessmentAttempt | null;
};

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: string[];
  points: number;
  position: number;
};

export type TeacherAssessmentQuestion = AssessmentQuestion & {
  correctOption: number;
  explanation: string | null;
};

export type AssessmentAttempt = {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
};

export type StudentAssessment = Assessment & {
  questions: AssessmentQuestion[];
};

export type AssessmentReviewQuestion = TeacherAssessmentQuestion & {
  selectedOption: number;
  isCorrect: boolean;
};

export type AssessmentReportRow = {
  studentId: string;
  displayName: string | null;
  attemptId: string | null;
  status: "missing" | "submitted";
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  submittedAt: string | null;
  joinedAt: string;
};

export type AssessmentQuestionAnalysis = {
  questionId: string;
  prompt: string;
  position: number;
  points: number;
  answeredCount: number;
  correctCount: number;
  correctPercentage: number;
};

export type AssessmentReportSummary = {
  studentCount: number;
  submittedCount: number;
  missingCount: number;
  averagePercentage: number;
  highestPercentage: number;
};

export type AssessmentRow = {
  id: string;
  classroom_id: string;
  created_by: string;
  title: string;
  description: string | null;
  assessment_type: string;
  status: string;
  due_at: string | null;
  duration_minutes: number | null;
  question_count: number;
  created_at: string;
};

export type AssessmentAttemptRow = {
  id: string;
  assessment_id: string;
  student_id: string;
  score: number;
  max_score: number;
  percentage: number | string;
  submitted_at: string;
};

export type AssessmentReportRpcRow = {
  student_id: string;
  display_name: string | null;
  attempt_id: string | null;
  status: string;
  score: number | null;
  max_score: number | null;
  percentage: number | string | null;
  submitted_at: string | null;
  joined_at: string;
};

export type AssessmentAnalysisRpcRow = {
  question_id: string;
  prompt: string;
  question_position: number;
  points: number;
  answered_count: number | string;
  correct_count: number | string;
  correct_percentage: number | string;
};

function asAssessmentType(value: string): AssessmentType {
  if (value === "diagnostic" || value === "summative") {
    return value;
  }
  return "formative";
}

function asAssessmentStatus(value: string): AssessmentStatus {
  return value === "closed" ? "closed" : "published";
}

function numeric(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapAssessmentRow(
  row: AssessmentRow,
  extras?: Partial<Assessment>
): Assessment {
  return {
    id: row.id,
    classroomId: row.classroom_id,
    createdBy: row.created_by,
    title: row.title,
    description: row.description,
    type: asAssessmentType(row.assessment_type),
    status: asAssessmentStatus(row.status),
    dueAt: row.due_at,
    durationMinutes: row.duration_minutes,
    questionCount: row.question_count,
    createdAt: row.created_at,
    ...extras
  };
}

export function mapAssessmentAttemptRow(row: AssessmentAttemptRow): AssessmentAttempt {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    studentId: row.student_id,
    score: row.score,
    maxScore: row.max_score,
    percentage: numeric(row.percentage),
    submittedAt: row.submitted_at
  };
}

export function mapAssessmentReportRow(row: AssessmentReportRpcRow): AssessmentReportRow {
  return {
    studentId: row.student_id,
    displayName: row.display_name,
    attemptId: row.attempt_id,
    status: row.status === "submitted" ? "submitted" : "missing",
    score: row.score,
    maxScore: row.max_score,
    percentage: row.percentage === null ? null : numeric(row.percentage),
    submittedAt: row.submitted_at,
    joinedAt: row.joined_at
  };
}

export function mapAssessmentAnalysisRow(
  row: AssessmentAnalysisRpcRow
): AssessmentQuestionAnalysis {
  return {
    questionId: row.question_id,
    prompt: row.prompt,
    position: row.question_position,
    points: row.points,
    answeredCount: numeric(row.answered_count),
    correctCount: numeric(row.correct_count),
    correctPercentage: numeric(row.correct_percentage)
  };
}

export function summarizeAssessmentReport(
  rows: AssessmentReportRow[]
): AssessmentReportSummary {
  const submitted = rows.filter(
    (row): row is AssessmentReportRow & { percentage: number } =>
      row.status === "submitted" && row.percentage !== null
  );
  const percentages = submitted.map((row) => row.percentage);

  return {
    studentCount: rows.length,
    submittedCount: submitted.length,
    missingCount: rows.length - submitted.length,
    averagePercentage:
      percentages.length === 0
        ? 0
        : Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length),
    highestPercentage: percentages.length === 0 ? 0 : Math.max(...percentages)
  };
}

export function isAssessmentExpired(assessment: Pick<Assessment, "dueAt" | "status">, now = new Date()) {
  return assessment.status === "closed" || Boolean(assessment.dueAt && new Date(assessment.dueAt) < now);
}
