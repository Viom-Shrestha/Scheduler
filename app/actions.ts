"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db";
import type { Status, TaskInput } from "@/lib/types";
import { STATUSES } from "@/lib/types";

function parseTaskInput(formData: FormData): TaskInput {
  const project = String(formData.get("project") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "active") as Status;
  const detail = String(formData.get("detail") ?? "").trim();
  const waitingOn = String(formData.get("waitingOn") ?? "").trim();
  const due = String(formData.get("due") ?? "").trim();

  if (!project) throw new Error("Project is required");
  if (!title) throw new Error("Title is required");
  if (!STATUSES.includes(status)) throw new Error("Invalid status");

  return {
    project,
    title,
    status,
    detail: detail || undefined,
    waitingOn: waitingOn || undefined,
    due: due || undefined,
  };
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const input = parseTaskInput(formData);
  await db.createTask(input);
  revalidatePath("/");
}

export async function updateTaskAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing task id");
  const input = parseTaskInput(formData);
  await db.updateTask(id, input);
  revalidatePath("/");
}

export async function deleteTaskAction(id: string): Promise<void> {
  await db.deleteTask(id);
  revalidatePath("/");
}

export async function setStatusAction(id: string, status: Status): Promise<void> {
  await db.setStatus(id, status);
  revalidatePath("/");
}

export async function moveTaskAction(id: string, project: string, status: Status): Promise<void> {
  await db.moveTask(id, project, status);
  revalidatePath("/");
}
