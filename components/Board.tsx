import type { Task } from "@/lib/types";
import { STATUSES, STATUS_LABEL } from "@/lib/types";
import { LANE_META, projectInitials, projectSwatch } from "@/lib/colors";
import LaneCell from "./LaneCell";

export default function Board({
  projects,
  tasksByProject,
  totalCount,
  onOpenTask,
  onQuickDone,
  onAddTask,
}: {
  projects: string[];
  tasksByProject: Map<string, Task[]>;
  totalCount: number;
  onOpenTask: (task: Task) => void;
  onQuickDone: (id: string) => void;
  onAddTask: () => void;
}) {
  return (
    <section className="relative rounded-[28px] bg-white px-7 pb-6 pt-6 shadow-[0_6px_26px_rgba(90,80,160,0.1)]">
      {totalCount > 0 && (
        <div
          className="absolute -top-3.5 right-8 rounded-full px-3.5 py-1.5 text-[13px] font-bold text-[#0B3F6B] shadow-[0_4px_12px_rgba(47,169,245,0.3)]"
          style={{ background: "#2FA9F5", transform: "rotate(4deg)" }}
        >
          {totalCount} {totalCount === 1 ? "thing" : "things"}, all written down
        </div>
      )}

      <div
        className="grid items-center gap-x-5 pb-4 pt-1"
        style={{ gridTemplateColumns: "170px repeat(4, minmax(0, 1fr))" }}
      >
        <div className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-ink-muted">
          project
        </div>
        {STATUSES.map((status) => {
          const meta = LANE_META[status];
          const count = Array.from(tasksByProject.values())
            .flat()
            .filter((t) => t.status === status).length;
          return (
            <div
              key={status}
              className="inline-flex w-fit items-center gap-2 justify-self-start rounded-full py-1.5 pl-2.5 pr-3.5"
              style={{ background: meta.bg }}
            >
              <span
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
                style={{ background: meta.color }}
              >
                <span
                  className="h-[9px] w-[9px] bg-white"
                  style={{ clipPath: meta.glyph }}
                />
              </span>
              <span
                className="whitespace-nowrap font-display text-[16.5px] font-bold"
                style={{ color: meta.fg }}
              >
                {STATUS_LABEL[status]}
              </span>
              <span className="text-[12.5px] font-bold opacity-60" style={{ color: meta.fg }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="py-10 text-center text-sm text-ink-muted">
          Nothing on the board yet — add your first task below.
        </div>
      )}

      {projects.map((project) => {
        const tasks = tasksByProject.get(project) ?? [];
        const swatch = projectSwatch(project);
        return (
          <div
            key={project}
            className="dotted-top grid items-stretch gap-x-5 py-4"
            style={{ gridTemplateColumns: "170px repeat(4, minmax(0, 1fr))" }}
          >
            <div className="flex items-start gap-2.5 pt-0.5">
              <span
                className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[10px] font-display text-sm font-extrabold text-white"
                style={{ background: swatch.dot, boxShadow: `0 3px 8px ${swatch.shadow}` }}
              >
                {projectInitials(project)}
              </span>
              <div className="font-display text-[16px] font-bold leading-tight text-wrap-pretty text-ink">
                {project}
              </div>
            </div>

            {STATUSES.map((status) => (
              <LaneCell
                key={status}
                project={project}
                status={status}
                tasks={tasks.filter((t) => t.status === status)}
                onOpenTask={onOpenTask}
                onQuickDone={onQuickDone}
              />
            ))}
          </div>
        );
      })}

      <div className="dotted-top flex items-center gap-3.5 pt-4">
        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[#C3BCF0] bg-[#F7F6FE] px-5 py-2.5 font-display text-[15px] font-bold text-[#5B4BD6] transition hover:border-pink hover:text-pink"
        >
          <span className="-mt-0.5 text-[19px] leading-none">+</span>
          Add a task — pick a project and a lane
        </button>
      </div>
    </section>
  );
}
