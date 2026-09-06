"use client";

import { useState } from "react";
import { buildMonthGrid, formatDueLabel, formatMonthYear, todayISO } from "@/lib/dates";

export default function Calendar({ dueDates }: { dueDates: Set<string> }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const { weekdayLetters, days } = buildMonthGrid(cursor.year, cursor.month, dueDates);
  const today = todayISO();
  const todayHasDue = dueDates.has(today);

  function shiftMonth(delta: number) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_6px_26px_rgba(90,80,160,0.1)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-[22px] font-bold text-ink">
          {formatMonthYear(cursor.year, cursor.month)}
        </div>
        <div className="flex gap-2 text-sm font-bold" style={{ color: "#5B4BD6" }}>
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "#EAE7FB" }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "#EAE7FB" }}
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdayLetters.map((d, i) => (
          <div
            key={i}
            className="pb-1.5 text-center text-[11px] font-bold tracking-[0.08em] text-ink-muted"
          >
            {d}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-[13.5px]"
            style={{
              background: day.isToday ? "#FF3F7F" : day.hasDue ? "#EDEBFC" : "transparent",
              color: day.isToday ? "#FFFFFF" : day.inMonth ? "#3A3465" : "transparent",
              fontWeight: day.isToday ? 800 : 600,
            }}
          >
            <span>{day.date || ""}</span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: day.hasDue ? (day.isToday ? "#FFFFFF" : "#5B4BD6") : "transparent" }}
            />
          </div>
        ))}
      </div>

      <div
        className="mt-4.5 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[12.5px] font-semibold"
        style={{ background: "#EDEBFC", color: "#4A3EA8" }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FF3F7F" }} />
        today is {formatDueLabel(today)} — {todayHasDue ? "something's due" : "nothing due"}
      </div>
    </div>
  );
}
