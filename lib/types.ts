export type Status = "active" | "waiting" | "someday" | "done";

export interface Task {
  id: string;
  project: string;
  title: string;
  detail?: string;
  status: Status;
  waitingOn?: string;
  since?: string;
  due?: string;
  createdAt: string;
}

export interface TaskInput {
  project: string;
  title: string;
  detail?: string;
  status: Status;
  waitingOn?: string;
  due?: string;
}

/** Seed-only: lets first-run data specify `since` directly instead of it being stamped on insert. */
export interface SeedTask extends TaskInput {
  since?: string;
}

export const STATUSES: Status[] = ["active", "waiting", "someday", "done"];

export const STATUS_LABEL: Record<Status, string> = {
  active: "Active",
  waiting: "Waiting On",
  someday: "Someday",
  done: "Done",
};
