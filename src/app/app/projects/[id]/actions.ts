"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/lib/types";

export type TaskInput = {
  project_id: string;
  status_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  assignee_id: string | null;
  contact_id: string | null;
  due_date: string | null;
};

export async function createTask(input: TaskInput & { position: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, created_by: user?.id ?? null })
    .select("*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_color), contact:contacts(id, name)")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/app/projects/${input.project_id}`);
  return data;
}

export async function updateTask(
  id: string,
  projectId: string,
  input: Partial<TaskInput>,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select("*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_color), contact:contacts(id, name)")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/app/projects/${projectId}`);
  return data;
}

export async function deleteTask(id: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/app/projects/${projectId}`);
}

export async function createTaskStatus(input: {
  project_id: string;
  name: string;
  color: string;
  position: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_statuses")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/app/projects/${input.project_id}`);
  return data;
}

export async function deleteTaskStatus(id: string, projectId: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("status_id", id);

  if (count && count > 0) {
    throw new Error("Move or delete the tasks in this column first.");
  }

  const { error } = await supabase.from("task_statuses").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/app/projects/${projectId}`);
}
