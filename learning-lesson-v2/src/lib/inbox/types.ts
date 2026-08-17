export const INBOX_DUE_SOON_MS = 72 * 60 * 60 * 1000;
export const INBOX_LIMIT = 20;

export type InboxKind =
  | "needs_changes"
  | "open_assessment"
  | "overdue"
  | "due_soon"
  | "waiting"
  | "submitted"
  | "feedback";

export type InboxUrgency = "now" | "soon" | "info";

export type StudentInboxItem = {
  id: string;
  kind: InboxKind;
  urgency: InboxUrgency;
  href: string;
  title: string;
  classroomName: string | null;
  dueAt: string | null;
  note: string | null;
  occurredAt: string;
};
