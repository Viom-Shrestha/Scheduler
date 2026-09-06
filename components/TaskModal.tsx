"use client";

import { useEffect, useState, useTransition } from "react";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "@/app/actions";
import { LANE_META } from "@/lib/colors";
import { STATUSES, STATUS_LABEL } from "@/lib/types";
import type { Status, Task } from "@/lib/types";

export default function TaskModal({
  task,
  defaultStatus,
  knownProjects,
  onClose,
}: {
  task: Task | null;
  defaultStatus?: Status;
  knownProjects: string[];
  onClose: () => void;
}) {
  const editing = task !== null;

  const [project, setProject] = useState(task?.project ?? "");
  const [title, setTitle] = useState(task?.title ?? "");
  const [detail, setDetail] = useState(task?.detail ?? "");
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus ?? "active");
  const [waitingOn, setWaitingOn] = useState(task?.waitingOn ?? "");
  const [due, setDue] = useState(task?.due ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project.trim() || !title.trim()) {
      setError("Project and title are both needed.");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.set("project", project);
    formData.set("title", title);
    formData.set("detail", detail);
    formData.set("status", status);
    formData.set("waitingOn", waitingOn);
    formData.set("due", due);

    startTransition(async () => {
      try {
        if (editing) {
          formData.set("id", task.id);
          await updateTaskAction(formData);
        } else {
          await createTaskAction(formData);
        }
        onClose();
      } catch {
        setError("Couldn't save that — try again.");
      }
    });
  }

  function handleDelete() {
    if (!task) return;
    startTransition(async () => {
      await deleteTaskAction(task.id);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#241F45]/35 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-[24px] bg-white p-7 shadow-[0_20px_60px_rgba(36,31,69,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 font-display text-[22px] font-bold text-ink">
          {editing ? "Edit task" : "Add a task"}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">
              Project
            </label>
            <input
              list="project-options"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. Marigold School Website"
              className="rounded-xl border border-[#E4E1F5] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#5B4BD6]"
            />
            <datalist id="project-options">
              {knownProjects.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The actual sub-task"
              className="rounded-xl border border-[#E4E1F5] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#5B4BD6]"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const meta = LANE_META[s];
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className="rounded-full px-3.5 py-1.5 text-[13px] font-bold transition"
                    style={{
                      background: active ? meta.color : meta.bg,
                      color: active ? "#FFFFFF" : meta.fg,
                    }}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {status === "waiting" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">
                Waiting on
              </label>
              <input
                value={waitingOn}
                onChange={(e) => setWaitingOn(e.target.value)}
                placeholder="Who or what it's blocked on"
                className="rounded-xl border border-[#E4E1F5] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#5B4BD6]"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">
              Due date <span className="font-normal normal-case text-ink-muted/70">(optional)</span>
            </label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="rounded-xl border border-[#E4E1F5] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#5B4BD6]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">
              Detail <span className="font-normal normal-case text-ink-muted/70">(optional)</span>
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              className="resize-none rounded-xl border border-[#E4E1F5] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#5B4BD6]"
            />
          </div>

          {error && <div className="text-[13px] font-medium text-[#C21A55]">{error}</div>}

          <div className="mt-1 flex items-center justify-between gap-3">
            {editing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="text-[13px] font-bold text-[#C21A55] hover:text-[#8f0f3d]"
              >
                Delete task
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-[14px] font-bold text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-pink px-6 py-2.5 font-display text-[15px] font-bold text-white shadow-[0_5px_16px_rgba(255,63,127,0.34)] transition hover:bg-pink-hover disabled:opacity-60"
              >
                {isPending ? "Saving…" : editing ? "Save changes" : "Add task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
