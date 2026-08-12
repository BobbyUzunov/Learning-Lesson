import {
  mapAssessmentAnalysisRow,
  mapAssessmentAttemptRow,
  mapAssessmentReportRow,
  mapAssessmentRow,
  type Assessment,
  type AssessmentAnalysisRpcRow,
  type AssessmentAttempt,
  type AssessmentAttemptRow,
  type AssessmentQuestionAnalysis,
  type AssessmentReportRow,
  type AssessmentReportRpcRow,
  type AssessmentReviewQuestion,
  type AssessmentRow,
  type StudentAssessment,
  type TeacherAssessmentQuestion
} from "@/lib/assessments/types";
import { getCurrentSession } from "./auth";
import { createClient } from "./server";
import { getMyClassroomIds } from "./memberships";
import { hasSupabaseDataEnv } from "./data-env";
import { throwLoadError } from "./load-error";

const assessmentColumns =
  "id, classroom_id, created_by, title, description, assessment_type, status, due_at, duration_minutes, question_count, created_at";

type AssessmentListRow = AssessmentRow & {
  classrooms: { name: string } | null;
  assessment_attempts: AssessmentAttemptRow[] | { count: number }[] | null;
};

type TeacherAssessmentRow = AssessmentRow & {
  classrooms: { name: string } | null;
  assessment_questions:
    | {
        id: string;
        prompt: string;
        options: unknown;
        correct_option: number;
        explanation: string | null;
        points: number;
        position: number;
      }[]
    | null;
};

type StudentAssessmentRpcRow = {
  assessment_id: string;
  classroom_id: string;
  classroom_name: string;
  title: string;
  description: string | null;
  assessment_type: string;
  status: string;
  due_at: string | null;
  duration_minutes: number | null;
  question_id: string;
  prompt: string;
  options: unknown;
  points: number;
  question_position: number;
};

type AssessmentReviewRpcRow = {
  question_id: string;
  prompt: string;
  options: unknown;
  selected_option: number;
  correct_option: number;
  is_correct: boolean;
  explanation: string | null;
  points: number;
  question_position: number;
};

function stringOptions(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((option): option is string => typeof option === "string") : [];
}

function countFromRelation(value: { count: number }[] | null | undefined) {
  return value?.[0]?.count ?? 0;
}

function mapAssessmentListRow(row: AssessmentListRow, ownAttempt = false): Assessment {
  const attempts = row.assessment_attempts ?? [];
  const attempt = ownAttempt
    ? (attempts as AssessmentAttemptRow[])[0]
      ? mapAssessmentAttemptRow((attempts as AssessmentAttemptRow[])[0])
      : null
    : undefined;

  return mapAssessmentRow(row, {
    classroomName: row.classrooms?.name,
    submissionCount: ownAttempt ? undefined : countFromRelation(attempts as { count: number }[]),
    attempt
  });
}

export async function getClassroomAssessments(classroomId: string): Promise<Assessment[]> {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_assessments")
    .select(
      `${assessmentColumns}, classrooms(name), assessment_attempts(count)`
    )
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (error) {
    throwLoadError("teacher_classroom_assessments_unavailable", error);
  }

  return ((data ?? []) as unknown as AssessmentListRow[]).map((row) => mapAssessmentListRow(row));
}

export async function getTeacherAssessments(): Promise<Assessment[]> {
  const session = await getCurrentSession();
  if (!session.user || !hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data: classrooms, error: classroomError } = await supabase.rpc(
    "list_teacher_classrooms"
  );
  if (classroomError) {
    throwLoadError("teacher_assessments_classrooms_unavailable", classroomError);
  }
  if (!classrooms?.length) {
    return [];
  }

  const classroomIds = (classrooms as { id: string }[]).map((classroom) => classroom.id);
  const { data, error } = await supabase
    .from("classroom_assessments")
    .select(
      `${assessmentColumns}, classrooms(name), assessment_attempts(count)`
    )
    .in("classroom_id", classroomIds)
    .order("created_at", { ascending: false });

  if (error) {
    throwLoadError("teacher_assessments_unavailable", error);
  }

  return ((data ?? []) as unknown as AssessmentListRow[]).map((row) => mapAssessmentListRow(row));
}

export async function getMyAssessments(): Promise<Assessment[]> {
  const session = await getCurrentSession();
  if (!session.user || !hasSupabaseDataEnv()) {
    return [];
  }

  const classroomIds = await getMyClassroomIds();
  if (!classroomIds.length) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_assessments")
    .select(
      `${assessmentColumns}, classrooms(name), assessment_attempts(id, assessment_id, student_id, score, max_score, percentage, submitted_at)`
    )
    .in("classroom_id", classroomIds)
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error) {
    throwLoadError("student_assessments_unavailable", error);
  }

  return ((data ?? []) as unknown as AssessmentListRow[]).map((row) => mapAssessmentListRow(row, true));
}

export async function getTeacherAssessmentById(
  assessmentId: string
): Promise<(Assessment & { questions: TeacherAssessmentQuestion[] }) | null> {
  if (!hasSupabaseDataEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_assessments")
    .select(
      `${assessmentColumns}, classrooms(name), assessment_questions(id, prompt, options, correct_option, explanation, points, position)`
    )
    .eq("id", assessmentId)
    .maybeSingle();

  if (error) {
    throwLoadError("teacher_assessment_unavailable", error);
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as TeacherAssessmentRow;
  const questions: TeacherAssessmentQuestion[] = (row.assessment_questions ?? [])
    .map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: stringOptions(question.options),
      correctOption: question.correct_option,
      explanation: question.explanation,
      points: question.points,
      position: question.position
    }))
    .sort((a, b) => a.position - b.position);

  return {
    ...mapAssessmentRow(row, { classroomName: row.classrooms?.name }),
    questions,
    questionCount: questions.length
  };
}

export async function getStudentAssessmentById(assessmentId: string): Promise<StudentAssessment | null> {
  if (!hasSupabaseDataEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_assessment_for_student", {
    p_assessment_id: assessmentId
  });

  if (error) {
    throwLoadError("student_assessment_unavailable", error);
  }

  if (!data?.length) {
    return null;
  }

  const rows = data as StudentAssessmentRpcRow[];
  const first = rows[0];
  const questions = rows.map((row) => ({
    id: row.question_id,
    prompt: row.prompt,
    options: stringOptions(row.options),
    points: row.points,
    position: row.question_position
  }));

  return {
    ...mapAssessmentRow({
      id: first.assessment_id,
      classroom_id: first.classroom_id,
      created_by: "",
      title: first.title,
      description: first.description,
      assessment_type: first.assessment_type,
      status: first.status,
      due_at: first.due_at,
      duration_minutes: first.duration_minutes,
      question_count: rows.length,
      created_at: ""
    }),
    classroomName: first.classroom_name,
    questions,
    questionCount: questions.length
  };
}

export async function getMyAssessmentAttempt(assessmentId: string): Promise<AssessmentAttempt | null> {
  if (!hasSupabaseDataEnv()) {
    return null;
  }

  const session = await getCurrentSession();
  if (!session.user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_attempts")
    .select("id, assessment_id, student_id, score, max_score, percentage, submitted_at")
    .eq("assessment_id", assessmentId)
    .eq("student_id", session.user.id)
    .maybeSingle();

  if (error) {
    throwLoadError("student_assessment_attempt_unavailable", error);
  }

  if (!data) {
    return null;
  }

  return mapAssessmentAttemptRow(data as AssessmentAttemptRow);
}

export async function getMyAssessmentReview(
  assessmentId: string
): Promise<AssessmentReviewQuestion[]> {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_assessment_review", {
    p_assessment_id: assessmentId
  });

  if (error) {
    throwLoadError("student_assessment_review_unavailable", error);
  }

  return ((data ?? []) as AssessmentReviewRpcRow[]).map((row) => ({
    id: row.question_id,
    prompt: row.prompt,
    options: stringOptions(row.options),
    selectedOption: row.selected_option,
    correctOption: row.correct_option,
    isCorrect: row.is_correct,
    explanation: row.explanation,
    points: row.points,
    position: row.question_position
  }));
}

export async function getAssessmentReport(assessmentId: string): Promise<AssessmentReportRow[]> {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_assessment_report", {
    p_assessment_id: assessmentId
  });

  if (error) {
    throwLoadError("teacher_assessment_report_unavailable", error);
  }

  return ((data ?? []) as AssessmentReportRpcRow[]).map(mapAssessmentReportRow);
}

export async function getAssessmentQuestionAnalysis(
  assessmentId: string
): Promise<AssessmentQuestionAnalysis[]> {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_assessment_question_analysis", {
    p_assessment_id: assessmentId
  });

  if (error) {
    throwLoadError("teacher_assessment_analysis_unavailable", error);
  }

  return ((data ?? []) as AssessmentAnalysisRpcRow[]).map(mapAssessmentAnalysisRow);
}
