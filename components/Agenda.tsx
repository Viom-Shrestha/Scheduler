import type { Task } from "@/lib/types";
import { projectSwatch } from "@/lib/colors";
import { formatWeekdayShort } from "@/lib/dates";

export default function Agenda({
  items,
  onOpenTask,
}: {
  items: Task[];
  onOpenTask: (task: Task) => void;
}) {
  return (
    <div className="rounded-[26px] bg-white px-6 pb-3 pt-5.5 shadow-[0_6px_26px_rgba(90,80,160,0.1)]">
      <div className="flex items-center gap-2.5">
        <div className="font-display text-[22px] font-bold text-ink">Coming up</div>
      </div>
      <div className="mb-3.5 mt-1 text-[13px] text-ink-muted">
        {items.length === 0
          ? "Nothing due in the next two weeks."
          : `Next two weeks, ${items.length} ${items.length === 1 ? "thing" : "things"}`}
      </div>

      {items.map((task) => {
        const swatch = projectSwatch(task.project);
        const day = task.due!.slice(8, 10).replace(/^0/, "");
        return (
          <button
            key={task.id}
            type="button"
            onClick={() => onOpenTask(task)}
            className="dotted-top flex w-full gap-4 py-3.5 text-left"
          >
            <div
              className="w-12 flex-none rounded-xl py-1 text-center"
              style={{ background: swatch.soft }}
            >
              <div
                className="text-[10.5px] font-bold uppercase tracking-[0.08em] opacity-75"
                style={{ color: swatch.ink }}
              >
                {formatWeekdayShort(task.due!)}
              </div>
              <div
                className="font-display text-[21px] font-extrabold leading-tight"
                style={{ color: swatch.ink }}
              >
                {day}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[14.5px] font-semibold leading-snug text-wrap-pretty text-ink">
                {task.title}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-ink-faint">
                <span className="h-2 w-2 rounded-full" style={{ background: swatch.dot }} />
                {task.project}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
