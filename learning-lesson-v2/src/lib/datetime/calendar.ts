const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
const TIME_PART = /^(\d{1,2}):(\d{2})/;

export const DEFAULT_DUE_TIME = "12:00";

export type CalendarCell = {
  day: number | null;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function normalizeTime(time: string) {
  const match = TIME_PART.exec(time);
  if (!match) {
    return DEFAULT_DUE_TIME;
  }

  return `${pad(Number(match[1]))}:${match[2]}`;
}

export function formatLocalDateTimeValue(year: number, monthIndex: number, day: number, time: string) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}T${normalizeTime(time)}`;
}

export function parseLocalDateTimeValue(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const match = LOCAL_DATE_TIME.exec(trimmed);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5])
    );
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getTimeFromLocalDateTime(value: string) {
  const parsed = parseLocalDateTimeValue(value);
  if (!parsed) {
    return "";
  }

  return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

/** Monday-first month grid, padded to complete weeks. */
export function buildCalendarCells(year: number, monthIndex: number): CalendarCell[] {
  const mondayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < mondayOffset; index += 1) {
    cells.push({ day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null });
  }

  return cells;
}

export function shiftMonth(year: number, monthIndex: number, delta: number) {
  const next = new Date(year, monthIndex + delta, 1);
  return { year: next.getFullYear(), monthIndex: next.getMonth() };
}

export function weekdayLabels(locale: string) {
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day);
  });
}

export function monthTitle(year: number, monthIndex: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex, 1)
  );
}

export function formatSelectedDueDate(value: string, locale: string) {
  const parsed = parseLocalDateTimeValue(value);
  if (!parsed) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}

export function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
