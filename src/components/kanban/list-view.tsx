"use client";

import { CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDueDate, PRIORITY_STYLES } from "@/lib/utils";
import type { TaskStatus, TaskWithRelations } from "@/lib/types";

export function ListView({
  statuses,
  tasks,
  onTaskClick,
}: {
  statuses: TaskStatus[];
  tasks: TaskWithRelations[];
  onTaskClick: (task: TaskWithRelations) => void;
}) {
  const statusById = new Map(statuses.map((s) => [s.id, s]));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {tasks.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">No tasks yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const status = statusById.get(task.status_id);
                const due = formatDueDate(task.due_date);
                const priority = PRIORITY_STYLES[task.priority];
                return (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-[#faf9fd]"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {task.title}
                      {task.contact && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          {task.contact.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {status && (
                        <Badge color={status.color}>{status.name}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {due ? (
                        <span
                          className={cn(
                            "flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                            due.isOverdue ? "bg-rose-100 text-rose-600" : "bg-[#efedf8] text-muted",
                          )}
                        >
                          <CalendarDays size={11} /> {due.formatted}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {task.assignee ? (
                        <Avatar
                          name={task.assignee.full_name}
                          color={task.assignee.avatar_color}
                          size={24}
                        />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
