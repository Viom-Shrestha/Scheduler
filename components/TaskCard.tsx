"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/lib/types";
import { projectSwatch } from "@/lib/colors";
import { daysSince, daysUntil, formatDueLabel } from "@/lib/dates";

function Meta({ task }: { task: Task }) {
  const swatch = projectSwatch(task.project);

  if (task.status === "waiting") {
    const n = task.since ? daysSince(task.since) : 0;
    return (
      <span
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
        style={{ background: "#FFDCE8", color: "#C21A55" }}
      >
        waiting {n} {n === 1 ? "day" : "days"}
      </span>
    );
  }

  if (task.due && task.status !== "done") {
    const until = daysUntil(task.due);
    const overdue = until < 0;
    return (
      <span
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
        style={{
          background: overdue ? "#FFDCE8" : swatch.soft,
          color: overdue ? "#C21A55" : swatch.ink,
        }}
      >
        due {formatDueLabel(task.due)}
      </span>
    );
  }

  return null;
}

export default function TaskCard({
  task,
  onOpen,
  onQuickDone,
  overlay = false,
}: {
  task: Task;
  onOpen: () => void;
  onQuickDone: () => void;
  /** Render as the floating drag preview: no drag wiring of its own, just the visual. */
  overlay?: boolean;
}) {
  const swatch = projectSwatch(task.project);
  const done = task.status === "done";

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: overlay,
  });

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      className="relative touch-none rounded-2xl py-3.5 pl-4 pr-3 shadow-[0_3px_10px_rgba(90,80,160,0.09)]"
      style={{
        background: done ? "var(--color-card-done-bg)" : "#FFFFFF",
        opacity: isDragging ? 0.35 : 1,
        cursor: overlay ? "grabbing" : "grab",
        transform: overlay ? "rotate(2deg)" : undefined,
        boxShadow: overlay ? "0 14px 30px rgba(36,31,69,0.25)" : undefined,
      }}
    >
      <div
        className="absolute bottom-3.5 left-0 top-3.5 w-1 rounded-r"
        style={{ background: done ? "#C6C1E4" : swatch.dot }}
      />
      {!done && (
        <button
          type="button"
          aria-label="Mark done"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onQuickDone();
          }}
          className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 opacity-40 transition hover:opacity-100"
          style={{ borderColor: swatch.dot }}
        >
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.2 5.7L8 1"
              stroke={swatch.dot}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <div
        className="pr-5 text-[14.5px] font-semibold leading-snug text-wrap-pretty"
        style={{ color: done ? "var(--color-card-done-fg)" : "var(--color-ink)" }}
      >
        {task.title}
      </div>
      {task.detail && (
        <div className="mt-1.5 text-[12.5px] leading-snug text-ink-faint text-wrap-pretty">
          {task.detail}
        </div>
      )}
      <Meta task={task} />
    </div>
  );
}
