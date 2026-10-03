import { describe, expect, it, vi } from "vitest";
import { nextStreakCount, touchDailyStreak, utcDateKey } from "./daily-streak";

describe("utcDateKey", () => {
  it("uses the UTC calendar date", () => {
    expect(utcDateKey(new Date("2026-10-03T23:59:59.000Z"))).toBe("2026-10-03");
    expect(utcDateKey(new Date("2026-10-04T00:00:00.000Z"))).toBe("2026-10-04");
  });
});

describe("nextStreakCount", () => {
  const today = new Date("2026-10-03T12:00:00.000Z");

  it("increments on consecutive UTC days", () => {
    expect(nextStreakCount({ streak: 4, lastVisit: "2026-10-02" }, today)).toBe(5);
  });

  it("does not double-count activity on the same UTC day", () => {
    expect(nextStreakCount({ streak: 7, lastVisit: "2026-10-03" }, today)).toBe(7);
  });

  it("resets to 1 after a missed day", () => {
    expect(nextStreakCount({ streak: 10, lastVisit: "2026-10-01" }, today)).toBe(1);
  });

  it("starts at 1 when there was no prior visit", () => {
    expect(nextStreakCount({ streak: 0, lastVisit: null }, today)).toBe(1);
  });
});

describe("touchDailyStreak", () => {
  it("returns streak data from record_daily_visit", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { streak: 3, last_visit: "2026-10-03" },
      error: null
    });
    const rpc = vi.fn().mockReturnValue({ single });

    const result = await touchDailyStreak({ rpc });

    expect(rpc).toHaveBeenCalledWith("record_daily_visit");
    expect(result).toEqual({ streak: 3, lastVisit: "2026-10-03" });
  });

  it("returns null when the RPC fails", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } });
    const rpc = vi.fn().mockReturnValue({ single });

    expect(await touchDailyStreak({ rpc })).toBeNull();
  });
});
