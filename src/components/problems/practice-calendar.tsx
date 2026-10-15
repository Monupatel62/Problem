"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getMonthCells(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  const totalDays = getDaysInMonth(monthDate);
  return [
    ...Array.from({ length: firstDay }, (_, index) => ({ key: `blank-${index}`, day: null })),
    ...Array.from({ length: totalDays }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 })),
  ];
}

export function PracticeCalendar({
  practiceDates,
  streakDays,
}: {
  practiceDates: string[];
  streakDays: number;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedWeek, setSelectedWeek] = useState(
    () => Math.min(5, Math.max(1, Math.ceil(today.getDate() / 7)))
  );

  const monthCells = getMonthCells(visibleMonth);

  const practicedDays = useMemo(() => {
    return new Set(
      practiceDates
        .map((dateKey) => new Date(`${dateKey}T00:00:00`))
        .filter(
          (date) =>
            date.getFullYear() === visibleMonth.getFullYear() &&
            date.getMonth() === visibleMonth.getMonth()
        )
        .map((date) => date.getDate())
    );
  }, [practiceDates, visibleMonth]);

  const selectedIsVisibleMonth =
    selectedDate.getFullYear() === visibleMonth.getFullYear() &&
    selectedDate.getMonth() === visibleMonth.getMonth();
  const selectedDay = selectedIsVisibleMonth ? selectedDate.getDate() : today.getDate();
  const daysLeftInWeek = Math.max(0, selectedWeek * 7 - selectedDay);

  function isMissedPracticeDay(day: number) {
    if (practiceDates.length === 0) return false;
    const dayDate = startOfDay(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)
    );
    return dayDate.getTime() < today.getTime() && !practicedDays.has(day);
  }

  function chooseDay(day: number) {
    const nextDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    setSelectedDate(nextDate);
    setSelectedWeek(Math.min(5, Math.max(1, Math.ceil(day / 7))));
  }

  function moveMonth(amount: number) {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + amount,
      1
    );
    setVisibleMonth(nextMonth);
    const nextDay = Math.min(selectedDate.getDate(), getDaysInMonth(nextMonth));
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay));
    setSelectedWeek(Math.min(5, Math.max(1, Math.ceil(nextDay / 7))));
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Practice Calendar</p>
          <p className="text-xs text-[var(--muted)]">
            {visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {streakDays > 0 && (
            <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600">
              🔥 {streakDays} day streak
            </span>
          )}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-2 text-center text-[11px]">
        {weekdayLabels.map((day, index) => (
          <span key={`${day}-${index}`} className="font-semibold text-[var(--muted)]">
            {day}
          </span>
        ))}
        {monthCells.map((cell) =>
          cell.day ? (
            <button
              type="button"
              key={cell.key}
              onClick={() => chooseDay(cell.day!)}
              className={`relative mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-medium transition ${
                isSameDay(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), cell.day),
                  selectedDate
                )
                  ? "bg-emerald-500 font-bold text-white shadow-sm"
                  : practicedDays.has(cell.day)
                    ? "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30"
                    : "text-[var(--text-soft)] hover:bg-[var(--bg)]"
              } ${
                isSameDay(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), cell.day),
                  today
                )
                  ? "ring-1 ring-emerald-300"
                  : ""
              }`}
            >
              {cell.day}
              {isMissedPracticeDay(cell.day) && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-400" />
              )}
            </button>
          ) : (
            <span key={cell.key} />
          )
        )}
      </div>

      {/* Week selector */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
        <span className="text-xs font-semibold text-[var(--muted)]">
          Week {selectedWeek} • {daysLeftInWeek} days left
        </span>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((week) => (
            <button
              key={week}
              type="button"
              onClick={() => setSelectedWeek(week)}
              className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition ${
                selectedWeek === week
                  ? "bg-orange-400 text-white"
                  : "text-[var(--muted)] hover:text-orange-500"
              }`}
            >
              {week}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
