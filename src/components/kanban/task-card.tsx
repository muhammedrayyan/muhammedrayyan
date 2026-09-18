"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDueDate, PRIORITY_STYLES } from "@/lib/utils";
import type { TaskWithRelations } from "@/lib/types";

export function TaskCard({
  task,
  onClick,
  dragOverlay = false,
}: {
  task: TaskWithRelations;
  onClick?: () => void;
  dragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "task", statusId: task.status_id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = formatDueDate(task.due_date);
  const priority = PRIORITY_STYLES[task.priority];

  return (
    <div
      ref={dragOverlay ? undefined : setNodeRef}
      style={dragOverlay ? undefined : style}
      {...(dragOverlay ? {} : attributes)}
      {...(dragOverlay ? {} : listeners)}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border border-border bg-surface p-3.5 shadow-sm transition-opacity hover:border-primary/40",
        isDragging && !dragOverlay && "opacity-30",
        dragOverlay && "rotate-2 shadow-lg",
      )}
    >
      <p className="text-sm font-medium text-foreground">{task.title}</p>

      {task.contact && (
        <p className="mt-1 truncate text-xs text-muted">{task.contact.name}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
          <span className="text-xs text-muted">{priority.label}</span>
          {due && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px]",
                due.isOverdue ? "bg-rose-100 text-rose-600" : "bg-[#efedf8] text-muted",
              )}
            >
              <CalendarDays size={11} />
              {due.formatted}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar name={task.assignee.full_name} color={task.assignee.avatar_color} size={22} />
        )}
      </div>
    </div>
  );
}
