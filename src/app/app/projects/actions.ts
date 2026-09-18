"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_STATUS_PALETTE } from "@/lib/utils";

export async function createProject(input: {
  name: string;
  description: string | null;
  color: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ ...input, created_by: user?.id ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const { error: statusError } = await supabase.from("task_statuses").insert(
    DEFAULT_STATUS_PALETTE.map((status, index) => ({
      project_id: project.id,
      name: status.name,
      color: status.color,
      position: index,
    })),
  );

  if (statusError) throw new Error(statusError.message);

  revalidatePath("/app/projects");
  revalidatePath("/app");
  return project;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/projects");
  revalidatePath("/app");
}
