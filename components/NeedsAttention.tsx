import type { Task } from "@/lib/types";
import { projectSwatch, GLYPH } from "@/lib/colors";
import { daysSince, daysUntil } from "@/lib/dates";

function Chip({
  task,
  tag,
  tagBg,
  tagFg,
  onOpen,
}: {
  task: Task;
  tag: string;
  tagBg: string;
  tagFg: string;
  onOpen: () => void;
}) {
  const swatch = projectSwatch(task.project);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex max-w-[280px] items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-1.5 text-left shadow-[0_2px_8px_rgba(90,80,160,0.12)] transition hover:shadow-[0_3px_12px_rgba(90,80,160,0.2)]"
    >
      <span className="h-2 w-2 flex-none rounded-full" style={{ background: swatch.dot }} />
      <span className="truncate text-[13px] font-semibold text-ink">{task.title}</span>
      <span
        className="flex-none whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-bold"
        style={{ background: tagBg, color: tagFg }}
      >
        {tag}
      </span>
    </button>
  );
}

function Group({
  label,
  items,
  tagFor,
  tagBg,
  tagFg,
  onOpenTask,
}: {
  label: string;
  items: Task[];
  tagFor: (task: Task) => string;
  tagBg: string;
  tagFg: string;
  onOpenTask: (task: Task) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-muted">
        {label} · {items.length}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((task) => (
          <Chip
            key={task.id}
            task={task}
            tag={tagFor(task)}
            tagBg={tagBg}
            tagFg={tagFg}
            onOpen={() => onOpenTask(task)}
          />
        ))}
      </div>
    </div>
  );
}

export default function NeedsAttention({
  overdue,
  dueToday,
  staleWaiting,
  onOpenTask,
}: {
  overdue: Task[];
  dueToday: Task[];
  staleWaiting: Task[];
  onOpenTask: (task: Task) => void;
}) {
  const empty = overdue.length === 0 && dueToday.length === 0 && staleWaiting.length === 0;

  if (empty) {
    return (
      <div className="flex items-center gap-2.5 rounded-[22px] bg-white px-6 py-4 text-[13.5px] font-semibold text-ink-muted shadow-[0_6px_26px_rgba(90,80,160,0.1)]">
        <span className="h-2.5 w-2.5 flex-none bg-[#FFD23F]" style={{ clipPath: GLYPH.star }} />
        Nothing urgent — you&rsquo;re on top of it.
      </div>
    );
  }

  return (
    <div className="rounded-[22px] bg-white px-6 py-5 shadow-[0_6px_26px_rgba(90,80,160,0.1)]">
      <div className="mb-3.5 font-display text-[19px] font-bold text-ink">Needs attention</div>
      <div className="flex flex-col gap-4">
        {overdue.length > 0 && (
          <Group
            label="Overdue"
            items={overdue}
            tagFor={(task) => {
              const n = Math.abs(daysUntil(task.due!));
              return `${n}d overdue`;
            }}
            tagBg="#FFDCE8"
            tagFg="#C21A55"
            onOpenTask={onOpenTask}
          />
        )}
        {dueToday.length > 0 && (
          <Group
            label="Due today"
            items={dueToday}
            tagFor={() => "today"}
            tagBg="#FFF3C4"
            tagFg="#8A6A00"
            onOpenTask={onOpenTask}
          />
        )}
        {staleWaiting.length > 0 && (
          <Group
            label="Waiting too long"
            items={staleWaiting}
            tagFor={(task) => `${daysSince(task.since!)}d waiting`}
            tagBg="#D2F4EF"
            tagFg="#00695C"
            onOpenTask={onOpenTask}
          />
        )}
      </div>
    </div>
  );
}
