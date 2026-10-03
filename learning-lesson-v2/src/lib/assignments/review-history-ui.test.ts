import { describe, expect, it } from "vitest";
import {
  formatReviewHistoryDeliverableSnippet,
  reviewHistoryEventLabel
} from "./review-history-ui";

const copy = {
  reviewHistoryEventTeacherReview: "Teacher review",
  reviewHistoryEventClearedOnResubmit: "Cleared on resubmit"
};

describe("review-history-ui", () => {
  it("labels known history event types", () => {
    expect(reviewHistoryEventLabel(copy, "teacher_review")).toBe("Teacher review");
    expect(reviewHistoryEventLabel(copy, "cleared_on_resubmit")).toBe("Cleared on resubmit");
  });

  it("prefers deliverable text snippets and falls back to URLs", () => {
    expect(formatReviewHistoryDeliverableSnippet("Hello world", null)).toBe("Hello world");
    expect(formatReviewHistoryDeliverableSnippet(null, "https://example.com")).toBe("https://example.com");
    expect(formatReviewHistoryDeliverableSnippet("   ", "https://example.com")).toBe("https://example.com");
  });
});
