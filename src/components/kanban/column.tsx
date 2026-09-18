"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Trash2 } from "lucide-react";
import { TaskCard } from "@/components/kanban/task-card";
import { cn } from "@/lib/utils";
import type { TaskStatus, TaskWithRelations } from "@/lib/types";

export function Column({
  status,
  tasks,
  onTaskClick,
  onAddTask,
  onDeleteStatus,
}: {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  onTaskClick: (task: TaskWithRelations) => void;
  onAddTask: (statusId: string) => void;
  onDeleteStatus: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: { type: "column" },
  });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
          <h3 className="text-sm font-semibold">{status.name}</h3>
          <span className="text-xs text-muted">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(status.id)}
            className="rounded-md p-1 text-muted hover:bg-[#efedf8] hover:text-foreground cursor-pointer"
            aria-label={`Add task to ${status.name}`}
          >
            <Plus size={14} />
          </button>
          {tasks.length === 0 && (
            <button
              onClick={() => onDeleteStatus(status)}
              className="rounded-md p-1 text-muted hover:bg-rose-50 hover:text-rose-500 cursor-pointer"
              aria-label={`Delete ${status.name}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl p-2 transition-colors",
          isOver ? "bg-primary/5" : "bg-[#f1f0f8]/60",
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <button
            onClick={() => onAddTask(status.id)}
            className="rounded-lg border border-dashed border-border py-4 text-xs text-muted hover:border-primary/40 hover:text-primary cursor-pointer"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
