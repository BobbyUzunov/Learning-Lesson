import type { AssignmentStatus } from "@/lib/assignments/types";
import type { MentorMode } from "./prompt";

const MIN_EFFORT_LENGTH = 4;

export function isMentorOpenStatus(status: AssignmentStatus | null | undefined) {
  return status === "missing" || status === "draft" || status === "needs_changes" || !status;
}

export function hasMentorEffort(effort: string) {
  return effort.trim().length >= MIN_EFFORT_LENGTH;
}

export function resolveMentorMode(status: AssignmentStatus, effort: string): MentorMode {
  if (status === "needs_changes" && hasMentorEffort(effort)) {
    return "explain";
  }

  if (hasMentorEffort(effort)) {
    return "review";
  }

  return "start";
}
