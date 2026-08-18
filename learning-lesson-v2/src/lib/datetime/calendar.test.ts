import { describe, expect, it } from "vitest";
import {
  buildCalendarCells,
  formatLocalDateTimeValue,
  getTimeFromLocalDateTime,
  normalizeTime,
  parseLocalDateTimeValue,
  shiftMonth,
  weekdayLabels
} from "./calendar";

describe("due-date calendar helpers", () => {
  it("builds a Monday-first grid for August 2026", () => {
    const cells = buildCalendarCells(2026, 7);
    const days = cells.map((cell) => cell.day);

    expect(days.slice(0, 7)).toEqual([null, null, null, null, null, 1, 2]);
    expect(days).toContain(31);
    expect(cells).toHaveLength(42);
  });

  it("round-trips a local datetime value without UTC shift", () => {
    const value = formatLocalDateTimeValue(2026, 7, 18, "12:30");

    expect(value).toBe("2026-08-18T12:30");
    expect(parseLocalDateTimeValue(value)?.getDate()).toBe(18);
    expect(getTimeFromLocalDateTime(value)).toBe("12:30");
  });

  it("normalizes time inputs from native time controls", () => {
    expect(normalizeTime("9:05")).toBe("09:05");
    expect(normalizeTime("12:00:00")).toBe("12:00");
    expect(normalizeTime("")).toBe("12:00");
  });

  it("shifts months across year boundaries", () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, monthIndex: 11 });
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, monthIndex: 0 });
  });

  it("returns Monday-first weekday labels", () => {
    expect(weekdayLabels("en-US")[0].toLowerCase().startsWith("mon")).toBe(true);
    expect(weekdayLabels("bg-BG")[0].toLowerCase().startsWith("п")).toBe(true);
  });
});
