"use client";

import { HeaderMascot } from "./Mascot";

const WEEKDAY_FULL = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export default function Header({
  activeCount,
  waitingCount,
  onAddTask,
}: {
  activeCount: number;
  waitingCount: number;
  onAddTask: () => void;
}) {
  const today = WEEKDAY_FULL[new Date().getDay()];

  return (
    <header className="relative flex flex-wrap items-end justify-between gap-8 px-2 pb-7">
      <div className="flex items-end gap-6">
        <HeaderMascot />
        <div className="pb-1.5">
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="font-display text-[44px] font-extrabold leading-none tracking-tight text-ink sm:text-[56px]">
              The Deck
            </div>
            <div
              className="whitespace-nowrap rounded-full px-3 py-1.5 font-display text-[13px] font-bold text-[#3C5C0B] shadow-[0_3px_8px_rgba(140,180,40,0.25)]"
              style={{ background: "#C9F27A", transform: "rotate(-6deg)" }}
            >
              {today}
            </div>
          </div>
          <div className="mt-2.5 max-w-[54ch] text-[17.5px] leading-relaxed text-ink-soft">
            {activeCount} active, {waitingCount} waiting on someone else.
          </div>
        </div>
      </div>

      <div className="flex flex-none items-center gap-3 pb-2.5">
        <div
          className="flex items-center gap-2.5 rounded-full px-4.5 py-3 shadow-[0_3px_10px_rgba(110,90,210,0.16)]"
          style={{ background: "#E7E3FE" }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#5B4BD6" }} />
          <span className="font-display text-lg font-bold" style={{ color: "#3B2E9B" }}>
            {activeCount}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#4A3EA8" }}>
            active
          </span>
        </div>
        <div
          className="flex items-center gap-2.5 rounded-full px-4.5 py-3 shadow-[0_3px_10px_rgba(0,170,150,0.14)]"
          style={{ background: "#D2F4EF" }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#00BFA6" }} />
          <span className="font-display text-lg font-bold" style={{ color: "#00695C" }}>
            {waitingCount}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#00796B" }}>
            waiting on others
          </span>
        </div>
        <button
          type="button"
          onClick={onAddTask}
          className="flex items-center gap-2 rounded-full bg-pink px-6 py-3.5 font-display text-[18px] font-bold text-white shadow-[0_5px_16px_rgba(255,63,127,0.34)] transition hover:bg-pink-hover"
        >
          <span className="-mt-0.5 text-2xl leading-none">+</span>
          Add a task
        </button>
      </div>
    </header>
  );
}
