import { notFound } from "next/navigation";
import { Board } from "@/components/kanban/board";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Project, TaskStatus, TaskWithRelations } from "@/lib/types";

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: statuses }, { data: tasks }, { data: profiles }, { data: contacts }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase
        .from("task_statuses")
        .select("*")
        .eq("project_id", id)
        .order("position", { ascending: true }),
      supabase
        .from("tasks")
        .select("*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_color), contact:contacts(id, name)")
        .eq("project_id", id)
        .order("position", { ascending: true }),
      supabase.from("profiles").select("*"),
      supabase.from("contacts").select("id, name").order("name", { ascending: true }),
    ]);

  if (!project) notFound();

  return (
    <Board
      project={project as Project}
      initialStatuses={(statuses as TaskStatus[] | null) ?? []}
      initialTasks={(tasks as unknown as TaskWithRelations[] | null) ?? []}
      profiles={(profiles as Profile[] | null) ?? []}
      contacts={contacts ?? []}
    />
  );
}
