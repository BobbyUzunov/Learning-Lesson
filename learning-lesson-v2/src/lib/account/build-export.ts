export type AccountExportPayload = {
  exportedAt: string;
  userId: string;
  email: string | null;
  profile: Record<string, unknown> | null;
  progress: Record<string, unknown>[];
  projectSubmissions: Record<string, unknown>[];
  assignmentSubmissions: Record<string, unknown>[];
  classroomMemberships: Record<string, unknown>[];
  mentorDailyUsage: Record<string, unknown>[];
};

export function buildAccountExportPayload(input: {
  userId: string;
  email: string | null;
  profile: Record<string, unknown> | null;
  progress: Record<string, unknown>[];
  projectSubmissions: Record<string, unknown>[];
  assignmentSubmissions: Record<string, unknown>[];
  classroomMemberships: Record<string, unknown>[];
  mentorDailyUsage: Record<string, unknown>[];
  exportedAt?: string;
}): AccountExportPayload {
  return {
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    userId: input.userId,
    email: input.email,
    profile: input.profile,
    progress: input.progress,
    projectSubmissions: input.projectSubmissions,
    assignmentSubmissions: input.assignmentSubmissions,
    classroomMemberships: input.classroomMemberships,
    mentorDailyUsage: input.mentorDailyUsage
  };
}

export function accountExportFilename(userId: string) {
  return `learning-lesson-export-${userId.slice(0, 8)}.json`;
}
