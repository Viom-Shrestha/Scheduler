"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { setStatusAction, moveTaskAction } from "@/app/actions";
import type { Status, Task } from "@/lib/types";
import { todayISO } from "@/lib/dates";
import { daysSince } from "@/lib/dates";
import Header from "./Header";
import Board from "./Board";
import Calendar from "./Calendar";
import Agenda from "./Agenda";
import WaitingPanel from "./WaitingPanel";
import NeedsAttention from "./NeedsAttention";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";
import { GLYPH } from "@/lib/colors";

const STALE_WAITING_DAYS = 7;

type ModalState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; task: Task };

export default function DeckApp({ tasks }: { tasks: Task[] }) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const projects = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.project))).sort((a, b) => a.localeCompare(b)),
    [tasks]
  );

  const tasksByProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const project of projects) map.set(project, []);
    for (const task of tasks) {
      map.get(task.project)!.push(task);
    }
    return map;
  }, [tasks, projects]);

  const activeCount = useMemo(() => tasks.filter((t) => t.status === "active").length, [tasks]);
  const waitingCount = useMemo(() => tasks.filter((t) => t.status === "waiting").length, [tasks]);

  const dueDates = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) if (t.due) set.add(t.due);
    return set;
  }, [tasks]);

  const agendaItems = useMemo(() => {
    const today = todayISO();
    return tasks
      .filter((t) => t.due && t.status !== "done" && t.due >= today)
      .sort((a, b) => (a.due! < b.due! ? -1 : 1))
      .slice(0, 8);
  }, [tasks]);

  const waitingItems = useMemo(() => {
    return tasks
      .filter((t) => t.status === "waiting")
      .sort((a, b) => daysSince(b.since ?? todayISO()) - daysSince(a.since ?? todayISO()));
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    const today = todayISO();
    return tasks
      .filter((t) => t.due && t.due < today && t.status !== "done")
      .sort((a, b) => (a.due! < b.due! ? -1 : 1));
  }, [tasks]);

  const dueTodayTasks = useMemo(() => {
    const today = todayISO();
    return tasks.filter((t) => t.due === today && t.status !== "done");
  }, [tasks]);

  const staleWaitingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === "waiting" && daysSince(t.since ?? todayISO()) >= STALE_WAITING_DAYS)
      .sort((a, b) => daysSince(b.since ?? todayISO()) - daysSince(a.since ?? todayISO()));
  }, [tasks]);

  function quickDone(id: string) {
    startTransition(async () => {
      await setStatusAction(id, "done");
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const task = (event.active.data.current as { task?: Task } | undefined)?.task;
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = (active.data.current as { task?: Task } | undefined)?.task;
    const target = over.data.current as { project?: string; status?: Status } | undefined;
    if (!task || !target?.project || !target.status) return;
    if (task.project === target.project && task.status === target.status) return;

    startTransition(async () => {
      await moveTaskAction(task.id, target.project!, target.status!);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Header activeCount={activeCount} waitingCount={waitingCount} onAddTask={() => setModal({ mode: "create" })} />

      <NeedsAttention
        overdue={overdueTasks}
        dueToday={dueTodayTasks}
        staleWaiting={staleWaitingTasks}
        onOpenTask={(task) => setModal({ mode: "edit", task })}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[372px_minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
        <Calendar dueDates={dueDates} />
        <Agenda items={agendaItems} onOpenTask={(task) => setModal({ mode: "edit", task })} />
        <WaitingPanel items={waitingItems} onOpenTask={(task) => setModal({ mode: "edit", task })} />
      </div>

      <DndContext
        id="deck-board"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Board
          projects={projects}
          tasksByProject={tasksByProject}
          totalCount={tasks.length}
          onOpenTask={(task) => setModal({ mode: "edit", task })}
          onQuickDone={quickDone}
          onAddTask={() => setModal({ mode: "create" })}
        />
        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} onOpen={() => {}} onQuickDone={() => {}} overlay />
          )}
        </DragOverlay>
      </DndContext>

      <div className="mt-2 flex items-center justify-center gap-2.5 text-[13px] font-semibold text-ink-muted">
        <span className="h-2.5 w-2.5 bg-[#FFD23F]" style={{ clipPath: GLYPH.star }} />
        everything is written down
      </div>

      {modal.mode !== "closed" && (
        <TaskModal
          task={modal.mode === "edit" ? modal.task : null}
          knownProjects={projects}
          onClose={() => setModal({ mode: "closed" })}
        />
      )}
    </div>
  );
}
