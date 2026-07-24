import { createClient } from "./server";
import { getCurrentSession } from "./auth";
import {
  mapAssignmentReportRow,
  mapAssignmentSubmissionRow,
  mapClassroomAssignmentRow,
  type AssignmentReportRow,
  type AssignmentReportRpcRow,
  type AssignmentStatus,
  type AssignmentSubmission,
  type AssignmentSubmissionRow,
  type ClassroomAssignment,
  type ClassroomAssignmentRow
} from "@/lib/assignments/types";

const assignmentColumns =
  "id, classroom_id, mission_id, assigned_by, title_override, instructions, due_at, created_at";

type MissionJoin = {
  title: string;
  title_bg: string;
  brief: string;
  brief_bg: string;
  deliverable: string;
  deliverable_bg: string;
  estimated_minutes: number;
};

type AssignmentWithMission = ClassroomAssignmentRow & {
  curriculum_missions: MissionJoin | null;
};

type StudentAssignmentRow = ClassroomAssignmentRow & {
  curriculum_missions: MissionJoin | null;
  classrooms: { name: string } | null;
  assignment_submissions: AssignmentSubmissionRow[] | null;
};

function missionExtras(mission: MissionJoin | null): Partial<ClassroomAssignment> {
  if (!mission) {
    return {};
  }

  return {
    missionTitle: mission.title,
    missionTitleBg: mission.title_bg,
    missionBrief: mission.brief,
    missionBriefBg: mission.brief_bg,
    missionDeliverable: mission.deliverable,
    missionDeliverableBg: mission.deliverable_bg,
    estimatedMinutes: mission.estimated_minutes
  };
}

export async function getClassroomAssignments(classroomId: string): Promise<ClassroomAssignment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_assignments")
    .select(
      `${assignmentColumns}, curriculum_missions(title, title_bg, brief, brief_bg, deliverable, deliverable_bg, estimated_minutes)`
    )
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as AssignmentWithMission[]).map((row) =>
    mapClassroomAssignmentRow(row, missionExtras(row.curriculum_missions))
  );
}

export async function getAssignmentById(id: string): Promise<ClassroomAssignment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_assignments")
    .select(
      `${assignmentColumns}, curriculum_missions(title, title_bg, brief, brief_bg, deliverable, deliverable_bg, estimated_minutes), classrooms(name)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as AssignmentWithMission & { classrooms: { name: string } | null };
  return mapClassroomAssignmentRow(row, {
    ...missionExtras(row.curriculum_missions),
    classroomName: row.classrooms?.name
  });
}

export async function getAssignmentReport(assignmentId: string): Promise<AssignmentReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_assignment_report", {
    p_assignment_id: assignmentId
  });

  if (error || !data) {
    return [];
  }

  return (data as AssignmentReportRpcRow[]).map(mapAssignmentReportRow);
}

export async function getMyAssignments(): Promise<ClassroomAssignment[]> {
  const session = await getCurrentSession();
  if (!session.user) {
    return [];
  }

  const supabase = await createClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("student_id", session.user.id);

  if (membershipError || !memberships || memberships.length === 0) {
    return [];
  }

  const classroomIds = memberships.map((row) => row.classroom_id as string);
  const { data, error } = await supabase
    .from("classroom_assignments")
    .select(
      `${assignmentColumns}, curriculum_missions(title, title_bg, brief, brief_bg, deliverable, deliverable_bg, estimated_minutes), classrooms(name), assignment_submissions(id, assignment_id, student_id, status, deliverable_text, deliverable_url, teacher_note, reviewed_by, submitted_at, reviewed_at)`
    )
    .in("classroom_id", classroomIds)
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as StudentAssignmentRow[]).map((row) => {
    const ownSubmission =
      row.assignment_submissions?.find((submission) => submission.student_id === session.user!.id) ?? null;

    return mapClassroomAssignmentRow(row, {
      ...missionExtras(row.curriculum_missions),
      classroomName: row.classrooms?.name,
      submissionStatus: (ownSubmission?.status as AssignmentStatus | undefined) ?? "missing",
      submissionId: ownSubmission?.id ?? null,
      teacherNote: ownSubmission?.teacher_note ?? null,
      submittedAt: ownSubmission?.submitted_at ?? null
    });
  });
}

export async function getMySubmissionForAssignment(
  assignmentId: string
): Promise<AssignmentSubmission | null> {
  const session = await getCurrentSession();
  if (!session.user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select(
      "id, assignment_id, student_id, status, deliverable_text, deliverable_url, teacher_note, reviewed_by, submitted_at, reviewed_at"
    )
    .eq("assignment_id", assignmentId)
    .eq("student_id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapAssignmentSubmissionRow(data as AssignmentSubmissionRow);
}
