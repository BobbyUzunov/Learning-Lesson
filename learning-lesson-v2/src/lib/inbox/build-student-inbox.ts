import { isAssessmentExpired, type Assessment } from "@/lib/assessments/types";
import type { ClassroomAssignment } from "@/lib/assignments/types";
import type { Language } from "@/lib/language";
import { INBOX_DUE_SOON_MS, INBOX_LIMIT, type InboxKind, type InboxUrgency, type StudentInboxItem } from "./types";

const KIND_RANK: Record<InboxKind, number> = {
  needs_changes: 0,
  open_assessment: 1,
  overdue: 2,
  due_soon: 3,
  waiting: 4,
  submitted: 5,
  feedback: 6
};

const URGENCY_RANK: Record<InboxUrgency, number> = {
  now: 0,
  soon: 1,
  info: 2
};

function assignmentTitle(assignment: ClassroomAssignment, language: Language) {
  if (language === "bg") {
    return assignment.titleOverride || assignment.missionTitleBg || assignment.missionTitle || assignment.missionId;
  }

  return assignment.titleOverride || assignment.missionTitle || assignment.missionId;
}

function dueTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildStudentInbox({
  assignments,
  assessments,
  language,
  now = new Date()
}: {
  assignments: ClassroomAssignment[];
  assessments: Assessment[];
  language: Language;
  now?: Date;
}): StudentInboxItem[] {
  const nowMs = now.getTime();
  const items: StudentInboxItem[] = [];

  for (const assignment of assignments) {
    const href = `/assignments/${assignment.id}`;
    const title = assignmentTitle(assignment, language);
    const dueMs = dueTime(assignment.dueAt);
    const overdue = dueMs !== null && dueMs < nowMs;
    const dueSoon = dueMs !== null && dueMs >= nowMs && dueMs - nowMs <= INBOX_DUE_SOON_MS;
    const status = assignment.submissionStatus ?? "missing";

    if (status === "needs_changes") {
      items.push({
        id: `assignment-needs-${assignment.id}`,
        kind: "needs_changes",
        urgency: "now",
        href,
        title,
        classroomName: assignment.classroomName ?? null,
        dueAt: assignment.dueAt,
        note: assignment.teacherNote ?? null,
        occurredAt: assignment.submittedAt || assignment.createdAt
      });
      continue;
    }

    if (status === "approved") {
      if (assignment.teacherNote) {
        items.push({
          id: `assignment-feedback-${assignment.id}`,
          kind: "feedback",
          urgency: "info",
          href,
          title,
          classroomName: assignment.classroomName ?? null,
          dueAt: assignment.dueAt,
          note: assignment.teacherNote,
          occurredAt: assignment.submittedAt || assignment.createdAt
        });
      }
      continue;
    }

    if (status === "submitted") {
      items.push({
        id: `assignment-submitted-${assignment.id}`,
        kind: "submitted",
        urgency: "info",
        href,
        title,
        classroomName: assignment.classroomName ?? null,
        dueAt: assignment.dueAt,
        note: null,
        occurredAt: assignment.submittedAt || assignment.createdAt
      });
      continue;
    }

    if (overdue) {
      items.push({
        id: `assignment-overdue-${assignment.id}`,
        kind: "overdue",
        urgency: "now",
        href,
        title,
        classroomName: assignment.classroomName ?? null,
        dueAt: assignment.dueAt,
        note: null,
        occurredAt: assignment.dueAt || assignment.createdAt
      });
      continue;
    }

    if (dueSoon) {
      items.push({
        id: `assignment-due-${assignment.id}`,
        kind: "due_soon",
        urgency: "soon",
        href,
        title,
        classroomName: assignment.classroomName ?? null,
        dueAt: assignment.dueAt,
        note: null,
        occurredAt: assignment.dueAt || assignment.createdAt
      });
      continue;
    }

    items.push({
      id: `assignment-waiting-${assignment.id}`,
      kind: "waiting",
      urgency: "soon",
      href,
      title,
      classroomName: assignment.classroomName ?? null,
      dueAt: assignment.dueAt,
      note: null,
      occurredAt: assignment.createdAt
    });
  }

  for (const assessment of assessments) {
    if (assessment.attempt || isAssessmentExpired(assessment, now)) {
      continue;
    }

    items.push({
      id: `assessment-open-${assessment.id}`,
      kind: "open_assessment",
      urgency: "now",
      href: `/assessments/${assessment.id}`,
      title: assessment.title,
      classroomName: assessment.classroomName ?? null,
      dueAt: assessment.dueAt,
      note: null,
      occurredAt: assessment.createdAt
    });
  }

  return items
    .sort((left, right) => {
      const urgency = URGENCY_RANK[left.urgency] - URGENCY_RANK[right.urgency];
      if (urgency !== 0) {
        return urgency;
      }

      const kind = KIND_RANK[left.kind] - KIND_RANK[right.kind];
      if (kind !== 0) {
        return kind;
      }

      const leftDue = dueTime(left.dueAt);
      const rightDue = dueTime(right.dueAt);
      if (leftDue !== null && rightDue !== null && leftDue !== rightDue) {
        return leftDue - rightDue;
      }
      if (leftDue !== null && rightDue === null) {
        return -1;
      }
      if (leftDue === null && rightDue !== null) {
        return 1;
      }

      return right.occurredAt.localeCompare(left.occurredAt);
    })
    .slice(0, INBOX_LIMIT);
}
