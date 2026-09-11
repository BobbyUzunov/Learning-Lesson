import { describe, expect, it, vi } from "vitest";
import { fetchMentorHintHistory, saveMentorHint } from "./mentor-history";

describe("mentor history store", () => {
  it("maps persisted directions in level order", async () => {
    const result = {
      data: [{
        id: "hint-1",
        hint_level: 1,
        mode: "start",
        effort: null,
        hint_text: "Break the task into two parts.",
        created_at: "2026-09-10T10:00:00.000Z"
      }],
      error: null
    };
    const chain = { select: vi.fn(), eq: vi.fn(), order: vi.fn() };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.order.mockResolvedValue(result);
    const supabase = { from: vi.fn(() => chain) };

    await expect(fetchMentorHintHistory(supabase as never, "assignment-1")).resolves.toEqual([{
      id: "hint-1",
      hintLevel: 1,
      mode: "start",
      effort: null,
      text: "Break the task into two parts.",
      createdAt: "2026-09-10T10:00:00.000Z"
    }]);
  });

  it("stores generation metadata with the learner and assignment", async () => {
    const insert = vi.fn(async () => ({ error: null }));
    const supabase = { from: vi.fn(() => ({ insert })) };

    await saveMentorHint(supabase as never, {
      userId: "user-1",
      assignmentId: "assignment-1",
      hintLevel: 2,
      mode: "review",
      effort: "My attempt",
      text: "Check the heading hierarchy.",
      model: "gpt-test",
      inputTokens: 30,
      outputTokens: 8
    });

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "user-1",
      assignment_id: "assignment-1",
      hint_level: 2,
      hint_text: "Check the heading hierarchy.",
      input_tokens: 30,
      output_tokens: 8
    }));
  });
});
