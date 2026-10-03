import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn()
}));

vi.mock("./server", () => ({
  createClient: vi.fn(async () => ({ rpc: mocks.rpc }))
}));

vi.mock("./data-env", () => ({
  hasSupabaseDataEnv: () => true
}));

import { getSubmissionReviewHistory } from "./assignments";

describe("getSubmissionReviewHistory", () => {
  it("maps RPC rows into review history entries", async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        {
          id: "hist-1",
          submission_id: "sub-1",
          status: "needs_changes",
          teacher_note: "Add headings",
          deliverable_text: "My work",
          deliverable_url: null,
          event_type: "teacher_review",
          reviewed_at: "2026-10-01T10:00:00.000Z",
          created_at: "2026-10-01T10:00:00.000Z"
        }
      ],
      error: null
    });

    await expect(getSubmissionReviewHistory("sub-1")).resolves.toEqual([
      {
        id: "hist-1",
        submissionId: "sub-1",
        status: "needs_changes",
        teacherNote: "Add headings",
        deliverableText: "My work",
        deliverableUrl: null,
        eventType: "teacher_review",
        reviewedAt: "2026-10-01T10:00:00.000Z",
        createdAt: "2026-10-01T10:00:00.000Z"
      }
    ]);

    expect(mocks.rpc).toHaveBeenCalledWith("get_submission_review_history", {
      p_submission_id: "sub-1"
    });
  });

  it("surfaces RPC failures as thrown errors", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "not_authorized" } });

    await expect(getSubmissionReviewHistory("sub-1")).rejects.toThrow("not_authorized");
  });
});
