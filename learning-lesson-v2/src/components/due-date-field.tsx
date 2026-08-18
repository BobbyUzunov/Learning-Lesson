"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildCalendarCells,
  DEFAULT_DUE_TIME,
  formatLocalDateTimeValue,
  formatSelectedDueDate,
  getTimeFromLocalDateTime,
  isSameCalendarDay,
  monthTitle,
  parseLocalDateTimeValue,
  shiftMonth,
  weekdayLabels
} from "@/lib/datetime/calendar";
import { t, type Language } from "@/lib/i18n";

type DueDateFieldProps = {
  language: Language;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function localeFor(language: Language) {
  return language === "bg" ? "bg-BG" : "en-US";
}

export function DueDateField({ language, label, value, onChange }: DueDateFieldProps) {
  const copy = t(language).dueDate;
  const locale = localeFor(language);
  const selected = parseLocalDateTimeValue(value);
  const today = new Date();
  const [view, setView] = useState(() => ({
    year: selected?.getFullYear() ?? today.getFullYear(),
    monthIndex: selected?.getMonth() ?? today.getMonth()
  }));

  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const cells = useMemo(
    () => buildCalendarCells(view.year, view.monthIndex),
    [view.monthIndex, view.year]
  );
  const timeValue = getTimeFromLocalDateTime(value);
  const selectedLabel = formatSelectedDueDate(value, locale);

  function selectDay(day: number) {
    onChange(
      formatLocalDateTimeValue(view.year, view.monthIndex, day, timeValue || DEFAULT_DUE_TIME)
    );
  }

  function changeMonth(delta: number) {
    setView((current) => shiftMonth(current.year, current.monthIndex, delta));
  }

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-bold text-ink/75">{label}</legend>

      <div className="mt-2 rounded-2xl border border-ink/12 bg-white p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            aria-label={copy.previousMonth}
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-ink/10 text-ink/70 transition hover:border-ink/25 hover:text-ink"
            onClick={() => changeMonth(-1)}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display text-center text-base font-bold capitalize tracking-tight sm:text-lg">
            {monthTitle(view.year, view.monthIndex, locale)}
          </p>
          <button
            aria-label={copy.nextMonth}
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-ink/10 text-ink/70 transition hover:border-ink/25 hover:text-ink"
            onClick={() => changeMonth(1)}
            type="button"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-1.5" role="grid" aria-label={label}>
          {weekdays.map((weekday) => (
            <div
              className="py-1.5 text-center text-xs font-bold uppercase tracking-wide text-ink/45 sm:text-sm"
              key={weekday}
            >
              {weekday}
            </div>
          ))}
          {cells.map((cell, index) => {
            if (cell.day === null) {
              return <div aria-hidden key={`empty-${index}`} />;
            }

            const day = cell.day;
            const cellDate = new Date(view.year, view.monthIndex, day);
            const isSelected = selected ? isSameCalendarDay(cellDate, selected) : false;
            const isToday = isSameCalendarDay(cellDate, today);

            return (
              <button
                aria-current={isToday ? "date" : undefined}
                aria-pressed={isSelected}
                className={`focus-ring flex min-h-12 w-full items-center justify-center rounded-xl text-base font-bold transition sm:min-h-14 sm:text-lg ${
                  isSelected
                    ? "bg-ink text-paper"
                    : isToday
                      ? "bg-mint/25 text-ink hover:bg-mint/40"
                      : "text-ink/80 hover:bg-ink/6"
                }`}
                key={day}
                onClick={() => selectDay(day)}
                type="button"
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-3 border-t border-ink/8 pt-3 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1 text-sm font-bold text-ink/75">
            {copy.timeLabel}
            <input
              className="focus-ring mt-1 min-h-11 w-full rounded-xl border border-ink/12 bg-white px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selected}
              onChange={(event) => {
                if (!selected) {
                  return;
                }

                onChange(
                  formatLocalDateTimeValue(
                    selected.getFullYear(),
                    selected.getMonth(),
                    selected.getDate(),
                    event.target.value
                  )
                );
              }}
              type="time"
              value={timeValue}
            />
          </label>
          {selected ? (
            <button
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold text-ink/50 underline-offset-4 hover:text-ink hover:underline"
              onClick={() => onChange("")}
              type="button"
            >
              {copy.clear}
            </button>
          ) : null}
        </div>

        <p className="mt-2 text-sm font-medium text-ink/55">
          {selectedLabel || copy.none}
        </p>
      </div>
    </fieldset>
  );
}
