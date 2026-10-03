import { describe, expect, it } from "vitest";
import { accountExportFilename, buildAccountExportPayload } from "./build-export";

describe("buildAccountExportPayload", () => {
  it("assembles a portable GDPR export document", () => {
    const payload = buildAccountExportPayload({
      exportedAt: "2026-08-31T12:00:00.000Z",
      userId: "00000000-0000-4000-8000-000000000099",
      email: "student@school.bg",
      profile: { display_name: "Student", role: "user" },
      consent: { privacy_accepted_at: "2026-08-01T00:00:00.000Z" },
      progress: [{ lesson_id: "1", completed: true }],
      projectSubmissions: [{ review_notes: "ok" }],
      assignmentSubmissions: [{ status: "submitted" }],
      assignmentReviewHistory: [{ event_type: "teacher_review" }],
      assessmentAttempts: [{ score: 8 }],
      classroomMemberships: [{ classroom_id: "class-1" }],
      mentorDailyUsage: [{ usage_date: "2026-08-31", request_count: 1 }],
      mentorHintHistory: [{ hint_level: 1, effort: "draft" }]
    });

    expect(payload.exportedAt).toBe("2026-08-31T12:00:00.000Z");
    expect(payload.userId).toContain("00000000");
    expect(payload.consent).toEqual({ privacy_accepted_at: "2026-08-01T00:00:00.000Z" });
    expect(payload.progress).toHaveLength(1);
    expect(payload.assignmentSubmissions).toHaveLength(1);
    expect(payload.assignmentReviewHistory).toHaveLength(1);
    expect(payload.assessmentAttempts).toHaveLength(1);
    expect(payload.mentorHintHistory).toHaveLength(1);
    expect(payload.projectSubmissions[0]).toMatchObject({ review_notes: "ok" });
    expect(accountExportFilename(payload.userId)).toBe("learning-lesson-export-00000000.json");
  });
});
