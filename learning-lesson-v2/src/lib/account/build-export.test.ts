import { describe, expect, it } from "vitest";
import { accountExportFilename, buildAccountExportPayload } from "./build-export";

describe("buildAccountExportPayload", () => {
  it("assembles a portable GDPR export document", () => {
    const payload = buildAccountExportPayload({
      exportedAt: "2026-08-31T12:00:00.000Z",
      userId: "00000000-0000-4000-8000-000000000099",
      email: "student@school.bg",
      profile: { display_name: "Student", role: "user" },
      progress: [{ lesson_id: "1", completed: true }],
      projectSubmissions: [],
      assignmentSubmissions: [{ status: "submitted" }],
      classroomMemberships: [{ classroom_id: "class-1" }],
      mentorDailyUsage: [{ usage_date: "2026-08-31", request_count: 1 }]
    });

    expect(payload.exportedAt).toBe("2026-08-31T12:00:00.000Z");
    expect(payload.userId).toContain("00000000");
    expect(payload.progress).toHaveLength(1);
    expect(payload.assignmentSubmissions).toHaveLength(1);
    expect(accountExportFilename(payload.userId)).toBe("learning-lesson-export-00000000.json");
  });
});
