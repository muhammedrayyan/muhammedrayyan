import { ProjectGrid } from "@/components/projects/project-grid";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("project_id"),
  ]);

  const taskCounts: Record<string, number> = {};
  for (const task of tasks ?? []) {
    taskCounts[task.project_id] = (taskCounts[task.project_id] ?? 0) + 1;
  }

  return (
    <ProjectGrid
      projects={(projects as Project[] | null) ?? []}
      taskCounts={taskCounts}
    />
  );
}
