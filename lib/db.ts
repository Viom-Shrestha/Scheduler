import "server-only";
import { createClient, type Client, type Row } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { todayISO } from "./dates";
import type { Status, Task, TaskInput } from "./types";
import { SEED_TASKS } from "./seed";

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./data/tasks.db";

if (DATABASE_URL.startsWith("file:")) {
  const path = DATABASE_URL.slice("file:".length);
  mkdirSync(dirname(path), { recursive: true });
}

let client: Client | null = null;
let ready: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return client;
}

function init(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await getClient().execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          project TEXT NOT NULL,
          title TEXT NOT NULL,
          detail TEXT,
          status TEXT NOT NULL,
          waitingOn TEXT,
          since TEXT,
          due TEXT,
          createdAt TEXT NOT NULL
        )
      `);
      const count = await getClient().execute("SELECT COUNT(*) as n FROM tasks");
      if (Number(count.rows[0].n) === 0) {
        await seedDatabase();
      }
    })();
  }
  return ready;
}

async function seedDatabase(): Promise<void> {
  const now = Date.now();
  await getClient().batch(
    SEED_TASKS.map((seed, i) => ({
      sql: `INSERT INTO tasks (id, project, title, detail, status, waitingOn, since, due, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        seed.project,
        seed.title,
        seed.detail ?? null,
        seed.status,
        seed.waitingOn ?? null,
        seed.since ?? null,
        seed.due ?? null,
        new Date(now + i).toISOString(),
      ],
    })),
    "write"
  );
}

function rowToTask(row: Row): Task {
  return {
    id: row.id as string,
    project: row.project as string,
    title: row.title as string,
    detail: (row.detail as string | null) ?? undefined,
    status: row.status as Status,
    waitingOn: (row.waitingOn as string | null) ?? undefined,
    since: (row.since as string | null) ?? undefined,
    due: (row.due as string | null) ?? undefined,
    createdAt: row.createdAt as string,
  };
}

export async function listTasks(): Promise<Task[]> {
  await init();
  const result = await getClient().execute(
    "SELECT * FROM tasks ORDER BY createdAt ASC"
  );
  return result.rows.map(rowToTask);
}

async function getTask(id: string): Promise<Task | null> {
  const result = await getClient().execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [id],
  });
  return result.rows.length ? rowToTask(result.rows[0]) : null;
}

/** since is server-managed: stamped the moment a task enters 'waiting', preserved while it stays there, cleared otherwise. */
function resolveSince(newStatus: Status, previous: Task | null): string | null {
  if (newStatus !== "waiting") return null;
  if (previous?.status === "waiting" && previous.since) return previous.since;
  return todayISO();
}

export async function createTask(input: TaskInput): Promise<Task> {
  await init();
  const task: Task = {
    id: crypto.randomUUID(),
    project: input.project.trim(),
    title: input.title.trim(),
    detail: input.detail?.trim() || undefined,
    status: input.status,
    waitingOn: input.status === "waiting" ? input.waitingOn?.trim() || undefined : undefined,
    since: resolveSince(input.status, null) ?? undefined,
    due: input.due || undefined,
    createdAt: new Date().toISOString(),
  };
  await getClient().execute({
    sql: `INSERT INTO tasks (id, project, title, detail, status, waitingOn, since, due, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      task.id,
      task.project,
      task.title,
      task.detail ?? null,
      task.status,
      task.waitingOn ?? null,
      task.since ?? null,
      task.due ?? null,
      task.createdAt,
    ],
  });
  return task;
}

export async function updateTask(id: string, input: TaskInput): Promise<void> {
  await init();
  const previous = await getTask(id);
  const since = resolveSince(input.status, previous);
  await getClient().execute({
    sql: `UPDATE tasks SET project = ?, title = ?, detail = ?, status = ?, waitingOn = ?, since = ?, due = ?
          WHERE id = ?`,
    args: [
      input.project.trim(),
      input.title.trim(),
      input.detail?.trim() || null,
      input.status,
      input.status === "waiting" ? input.waitingOn?.trim() || null : null,
      since,
      input.due || null,
      id,
    ],
  });
}

export async function setStatus(id: string, status: Status): Promise<void> {
  await init();
  const previous = await getTask(id);
  const since = resolveSince(status, previous);
  await getClient().execute({
    sql: "UPDATE tasks SET status = ?, since = ? WHERE id = ?",
    args: [status, since, id],
  });
}

/** Used by board drag-and-drop: moves a task to a new project/lane in one step. */
export async function moveTask(id: string, project: string, status: Status): Promise<void> {
  await init();
  const previous = await getTask(id);
  const since = resolveSince(status, previous);
  await getClient().execute({
    sql: "UPDATE tasks SET project = ?, status = ?, since = ? WHERE id = ?",
    args: [project, status, since, id],
  });
}

export async function deleteTask(id: string): Promise<void> {
  await init();
  await getClient().execute({ sql: "DELETE FROM tasks WHERE id = ?", args: [id] });
}
