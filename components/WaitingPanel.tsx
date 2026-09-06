import type { Task } from "@/lib/types";
import { projectInitials, projectSwatch } from "@/lib/colors";
import { daysSince } from "@/lib/dates";
import { PanelMascot } from "./Mascot";

export default function WaitingPanel({
  items,
  onOpenTask,
}: {
  items: Task[];
  onOpenTask: (task: Task) => void;
}) {
  return (
    <div
      className="relative rounded-[26px] px-6 pb-6 pt-5.5 shadow-[0_6px_26px_rgba(90,80,160,0.12)]"
      style={{ background: "#E6F7F3" }}
    >
      <PanelMascot />
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="font-display text-[22px] font-bold" style={{ color: "#0B3F6B" }}>
            Waiting on someone else
          </div>
          <div className="mt-1 text-[13px]" style={{ color: "#12776C" }}>
            Not your move. Follow up on anything past a week.
          </div>
        </div>
        <div
          className="flex-none pt-6.5 text-[11.5px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "#12776C" }}
        >
          {items.length} open
        </div>
      </div>

      <div className="mt-4.5 flex flex-col gap-2.5">
        {items.length === 0 && (
          <div className="py-4 text-center text-[13px]" style={{ color: "#12776C" }}>
            Nothing parked on someone else right now.
          </div>
        )}
        {items.map((task) => {
          const swatch = projectSwatch(task.project);
          const n = task.since ? daysSince(task.since) : 0;
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenTask(task)}
              className="flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 text-left shadow-[0_3px_10px_rgba(90,80,160,0.1)]"
            >
              <span
                className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[9px] font-display text-xs font-extrabold text-white"
                style={{ background: swatch.dot }}
              >
                {projectInitials(task.project)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[16px] font-bold leading-tight text-ink">
                  {task.waitingOn || task.project}
                </div>
                <div className="mt-0.5 text-[12.5px] text-wrap-pretty text-ink-faint">
                  {task.detail || task.title}
                </div>
              </div>
              <div className="flex flex-none items-center gap-3">
                <span
                  className="rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: swatch.soft, color: swatch.ink }}
                >
                  {n} {n === 1 ? "day" : "days"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
