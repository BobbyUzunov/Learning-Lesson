import { describe, expect, it, vi } from "vitest";
import { discardLocalGuestProgress, isGuestMergeSettled } from "./login-form";

describe("guest progress login handoff", () => {
  it("settles successful and terminal conflict responses", () => {
    expect(isGuestMergeSettled({ ok: true, status: 200 })).toBe(true);
    expect(isGuestMergeSettled({ ok: false, status: 409 })).toBe(true);
  });

  it("keeps retryable server failures unsettled", () => {
    expect(isGuestMergeSettled({ ok: false, status: 500 })).toBe(false);
    expect(isGuestMergeSettled({ ok: false, status: 503 })).toBe(false);
  });

  it("clears both local progress and the guest continuation marker", () => {
    const clearProgress = vi.fn();
    const storage = { removeItem: vi.fn() };

    discardLocalGuestProgress(clearProgress, storage);

    expect(clearProgress).toHaveBeenCalledOnce();
    expect(storage.removeItem).toHaveBeenCalledWith("learning-lesson-v2-guest-continue");
  });

  it("does not block login when either local cleanup operation fails", () => {
    const storage = {
      removeItem: vi.fn(() => {
        throw new Error("storage unavailable");
      })
    };

    expect(() =>
      discardLocalGuestProgress(() => {
        throw new Error("storage unavailable");
      }, storage)
    ).not.toThrow();
    expect(storage.removeItem).toHaveBeenCalledOnce();
  });
});
