export type AccountExportPayload = {
  exportedAt: string;
  userId: string;
  email: string | null;
  profile: Record<string, unknown> | null;
  consent: Record<string, unknown> | null;
  progress: Record<string, unknown>[];
  projectSubmissions: Record<string, unknown>[];
  assignmentSubmissions: Record<string, unknown>[];
  assignmentReviewHistory: Record<string, unknown>[];
  assessmentAttempts: Record<string, unknown>[];
  classroomMemberships: Record<string, unknown>[];
  mentorDailyUsage: Record<string, unknown>[];
  mentorHintHistory: Record<string, unknown>[];
};

export function buildAccountExportPayload(input: {
  userId: string;
  email: string | null;
  profile: Record<string, unknown> | null;
  consent: Record<string, unknown> | null;
  progress: Record<string, unknown>[];
  projectSubmissions: Record<string, unknown>[];
  assignmentSubmissions: Record<string, unknown>[];
  assignmentReviewHistory: Record<string, unknown>[];
  assessmentAttempts: Record<string, unknown>[];
  classroomMemberships: Record<string, unknown>[];
  mentorDailyUsage: Record<string, unknown>[];
  mentorHintHistory: Record<string, unknown>[];
  exportedAt?: string;
}): AccountExportPayload {
  return {
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    userId: input.userId,
    email: input.email,
    profile: input.profile,
    consent: input.consent,
    progress: input.progress,
    projectSubmissions: input.projectSubmissions,
    assignmentSubmissions: input.assignmentSubmissions,
    assignmentReviewHistory: input.assignmentReviewHistory,
    assessmentAttempts: input.assessmentAttempts,
    classroomMemberships: input.classroomMemberships,
    mentorDailyUsage: input.mentorDailyUsage,
    mentorHintHistory: input.mentorHintHistory
  };
}

export function accountExportFilename(userId: string) {
  return `learning-lesson-export-${userId.slice(0, 8)}.json`;
}

export function consentFromUserMetadata(metadata: Record<string, unknown> | undefined | null) {
  if (!metadata) {
    return null;
  }

  const privacyAcceptedAt = metadata.privacy_accepted_at;
  if (typeof privacyAcceptedAt !== "string" || !privacyAcceptedAt.trim()) {
    return null;
  }

  return {
    privacy_accepted_at: privacyAcceptedAt
  };
}
