import { describe, expect, it, vi } from "vitest";
import {
  fetchMentorHintHistory,
  finalizeAssignmentMentorHint,
  reserveAssignmentMentorSlot
} from "./mentor-history";

describe("mentor history store", () => {
  it("maps ready persisted directions in level order", async () => {
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

    expect(chain.eq).toHaveBeenCalledWith("status", "ready");
  });

  it("reserves mentor slots through the RPC wrapper", async () => {
    const single = vi.fn(async () => ({
      data: {
        outcome: "reserved",
        hint_id: "hint-slot-1",
        hint_text: null,
        request_count: 2,
        remaining: 3,
        daily_limit: 5
      },
      error: null
    }));
    const rpc = vi.fn(() => ({ single }));
    const supabase = { rpc };

    await expect(
      reserveAssignmentMentorSlot(supabase as never, {
        assignmentId: "assignment-1",
        hintLevel: 1,
        mode: "review",
        effort: "My attempt"
      })
    ).resolves.toEqual({
      outcome: "reserved",
      hintId: "hint-slot-1",
      hintText: null,
      count: 2,
      remaining: 3,
      limit: 5
    });

    expect(rpc).toHaveBeenCalledWith("reserve_assignment_mentor_slot", {
      p_assignment_id: "assignment-1",
      p_hint_level: 1,
      p_mode: "review",
      p_effort: "My attempt"
    });
  });

  it("finalizes reserved slots through the RPC wrapper", async () => {
    const rpc = vi.fn(async () => ({ error: null }));
    const supabase = { rpc };

    await finalizeAssignmentMentorHint(supabase as never, {
      hintId: "hint-slot-1",
      text: "Check the heading hierarchy.",
      model: "gpt-test",
      inputTokens: 30,
      outputTokens: 8
    });

    expect(rpc).toHaveBeenCalledWith("finalize_assignment_mentor_hint", {
      p_hint_id: "hint-slot-1",
      p_hint_text: "Check the heading hierarchy.",
      p_model: "gpt-test",
      p_input_tokens: 30,
      p_output_tokens: 8
    });
  });
});
