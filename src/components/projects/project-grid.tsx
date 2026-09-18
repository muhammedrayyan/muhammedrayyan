"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { deleteProject } from "@/app/app/projects/actions";
import type { Project } from "@/lib/types";

export function ProjectGrid({
  projects,
  taskCounts,
}: {
  projects: Project[];
  taskCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleDelete(e: React.MouseEvent, project: Project) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${project.name}" and all of its tasks?`)) return;
    await deleteProject(project.id);
    router.refresh();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            Boards for organizing your team&apos;s work
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted">
            No projects yet. Create your first board to start tracking tasks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/app/projects/${project.id}`}
              className="group relative rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: project.color }}
              >
                {project.name.slice(0, 1).toUpperCase()}
              </div>
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {project.description || "No description"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>{taskCounts[project.id] ?? 0} tasks</span>
                <button
                  onClick={(e) => handleDelete(e, project)}
                  className="rounded-md p-1.5 opacity-0 hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 cursor-pointer"
                  aria-label="Delete project"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ProjectFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
