import type { SubmissionReviewHistoryEventType } from "./types";

type ReviewHistoryCopy = {
  reviewHistoryEventTeacherReview: string;
  reviewHistoryEventClearedOnResubmit: string;
};

export function reviewHistoryEventLabel(
  copy: ReviewHistoryCopy,
  eventType: SubmissionReviewHistoryEventType
) {
  if (eventType === "cleared_on_resubmit") {
    return copy.reviewHistoryEventClearedOnResubmit;
  }
  return copy.reviewHistoryEventTeacherReview;
}

export function formatReviewHistoryDeliverableSnippet(
  deliverableText: string | null,
  deliverableUrl: string | null,
  maxLength = 160
) {
  const text = deliverableText?.trim();
  if (text) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  }
  const url = deliverableUrl?.trim();
  return url ?? null;
}
