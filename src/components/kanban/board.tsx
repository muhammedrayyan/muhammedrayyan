"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/kanban/column";
import { TaskCard } from "@/components/kanban/task-card";
import { TaskPanel, type TaskPanelSubmitInput } from "@/components/kanban/task-panel";
import { AddStatusModal } from "@/components/kanban/add-status-modal";
import { ListView } from "@/components/kanban/list-view";
import { createTask, updateTask, deleteTask, createTaskStatus, deleteTaskStatus } from "@/app/app/projects/[id]/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile, Project, TaskStatus, TaskWithRelations } from "@/lib/types";

type ContactOption = { id: string; name: string };
type ColumnsState = Record<string, TaskWithRelations[]>;

function groupByStatus(statuses: TaskStatus[], tasks: TaskWithRelations[]): ColumnsState {
  const map: ColumnsState = {};
  for (const status of statuses) map[status.id] = [];
  for (const task of [...tasks].sort((a, b) => a.position - b.position)) {
    (map[task.status_id] ??= []).push(task);
  }
  return map;
}

export function Board({
  project,
  initialStatuses,
  initialTasks,
  profiles,
  contacts,
}: {
  project: Project;
  initialStatuses: TaskStatus[];
  initialTasks: TaskWithRelations[];
  profiles: Profile[];
  contacts: ContactOption[];
}) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [columns, setColumns] = useState<ColumnsState>(() =>
    groupByStatus(initialStatuses, initialTasks),
  );
  const [view, setView] = useState<"board" | "list">("board");
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [panel, setPanel] = useState<{ task: TaskWithRelations | null; statusId?: string } | null>(
    null,
  );
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const originContainer = useRef<string | null>(null);

  const allTasks = useMemo(() => Object.values(columns).flat(), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function findContainer(id: string): string | undefined {
    if (columns[id]) return id;
    return Object.keys(columns).find((key) => columns[key].some((t) => t.id === id));
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const container = findContainer(id);
    originContainer.current = container ?? null;
    setActiveTask(allTasks.find((t) => t.id === id) ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((t) => t.id === active.id);
      if (activeIndex === -1) return prev;
      let overIndex = overItems.findIndex((t) => t.id === over.id);
      if (overIndex === -1) overIndex = overItems.length;

      const movedTask = { ...activeItems[activeIndex], status_id: overContainer };
      return {
        ...prev,
        [activeContainer]: activeItems.filter((t) => t.id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          movedTask,
          ...overItems.slice(overIndex),
        ],
      };
    });
  }

  async function resyncBoard() {
    const supabase = createClient();
    const { data } = await supabase
      .from("tasks")
      .select(
        "*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_color), contact:contacts(id, name)",
      )
      .eq("project_id", project.id)
      .order("position", { ascending: true });
    setColumns(groupByStatus(statuses, (data as unknown as TaskWithRelations[] | null) ?? []));
  }

  async function persistColumn(statusId: string, items: TaskWithRelations[]) {
    const supabase = createClient();
    const results = await Promise.all(
      items.map((task, index) =>
        supabase.from("tasks").update({ status_id: statusId, position: index }).eq("id", task.id),
      ),
    );
    if (results.some((r) => r.error)) {
      setSyncError("Couldn't save that move — your board was refreshed to match what's actually saved.");
      await resyncBoard();
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    const startContainer = originContainer.current;
    originContainer.current = null;
    if (!over || !startContainer) return;

    const currentContainer = findContainer(active.id as string);
    if (!currentContainer) return;

    if (currentContainer === startContainer && active.id !== over.id) {
      setColumns((prev) => {
        const items = prev[currentContainer];
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(items, oldIndex, newIndex);
        void persistColumn(currentContainer, reordered);
        return { ...prev, [currentContainer]: reordered };
      });
      return;
    }

    void persistColumn(currentContainer, columns[currentContainer]);
    if (startContainer !== currentContainer) {
      void persistColumn(startContainer, columns[startContainer]);
    }
  }

  async function handleCreateTask(input: TaskPanelSubmitInput) {
    const statusId = input.status_id;
    const position = columns[statusId]?.length ?? 0;
    const created = await createTask({ ...input, project_id: project.id, position });
    setColumns((prev) => ({
      ...prev,
      [statusId]: [...(prev[statusId] ?? []), created as unknown as TaskWithRelations],
    }));
  }

  async function handleUpdateTask(task: TaskWithRelations, input: TaskPanelSubmitInput) {
    const statusChanged = input.status_id !== task.status_id;
    const updated = (await updateTask(task.id, project.id, input)) as unknown as TaskWithRelations;

    if (statusChanged) {
      const supabase = createClient();
      const position = columns[updated.status_id]?.length ?? 0;
      await supabase.from("tasks").update({ position }).eq("id", updated.id);
      updated.position = position;
    }

    setColumns((prev) => {
      const next: ColumnsState = {};
      for (const [statusId, items] of Object.entries(prev)) {
        next[statusId] = items.filter((t) => t.id !== task.id);
      }
      next[updated.status_id] = [...(next[updated.status_id] ?? []), updated];
      return next;
    });
  }

  async function handleDeleteTask(task: TaskWithRelations) {
    await deleteTask(task.id, project.id);
    setColumns((prev) => ({
      ...prev,
      [task.status_id]: prev[task.status_id].filter((t) => t.id !== task.id),
    }));
  }

  async function handleAddStatus(input: { name: string; color: string }) {
    const created = await createTaskStatus({
      project_id: project.id,
      name: input.name,
      color: input.color,
      position: statuses.length,
    });
    setStatuses((prev) => [...prev, created]);
    setColumns((prev) => ({ ...prev, [created.id]: [] }));
  }

  async function handleDeleteStatus(status: TaskStatus) {
    if (!confirm(`Delete the "${status.name}" column?`)) return;
    try {
      await deleteTaskStatus(status.id, project.id);
      setStatuses((prev) => prev.filter((s) => s.id !== status.id));
      setColumns((prev) => {
        const next = { ...prev };
        delete next[status.id];
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete column");
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-border bg-surface px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: project.color }}
            >
              {project.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <button
                onClick={() => setView("board")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer",
                  view === "board" ? "bg-[#efedf8] text-foreground" : "text-muted",
                )}
              >
                <LayoutGrid size={14} /> Board
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer",
                  view === "list" ? "bg-[#efedf8] text-foreground" : "text-muted",
                )}
              >
                <List size={14} /> List
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => setPanel({ task: null, statusId: statuses[0]?.id })}
              disabled={statuses.length === 0}
            >
              <Plus size={14} /> New task
            </Button>
          </div>
        </div>
      </div>

      {syncError && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-8 py-2.5 text-sm text-amber-800">
          <span>{syncError}</span>
          <button
            onClick={() => setSyncError(null)}
            className="text-amber-700 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {view === "board" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-4 overflow-x-auto p-6">
            {statuses.map((status) => (
              <Column
                key={status.id}
                status={status}
                tasks={columns[status.id] ?? []}
                onTaskClick={(task) => setPanel({ task })}
                onAddTask={(statusId) => setPanel({ task: null, statusId })}
                onDeleteStatus={handleDeleteStatus}
              />
            ))}
            <button
              onClick={() => setAddStatusOpen(true)}
              className="h-fit w-56 shrink-0 rounded-xl border border-dashed border-border p-3 text-sm text-muted hover:border-primary/40 hover:text-primary cursor-pointer"
            >
              + Add status
            </button>
          </div>
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} dragOverlay />}
          </DragOverlay>
        </DndContext>
      ) : (
        <ListView
          statuses={statuses}
          tasks={allTasks}
          onTaskClick={(task) => setPanel({ task })}
        />
      )}

      <TaskPanel
        key={panel ? panel.task?.id ?? `new-${panel.statusId}` : "closed"}
        open={!!panel}
        onClose={() => setPanel(null)}
        task={panel?.task ?? null}
        defaultStatusId={panel?.statusId}
        statuses={statuses}
        profiles={profiles}
        contacts={contacts}
        onSubmit={(input) =>
          panel?.task ? handleUpdateTask(panel.task, input) : handleCreateTask(input)
        }
        onDelete={panel?.task ? () => handleDeleteTask(panel.task as TaskWithRelations) : undefined}
      />

      <AddStatusModal
        open={addStatusOpen}
        onClose={() => setAddStatusOpen(false)}
        onSubmit={handleAddStatus}
      />
    </div>
  );
}
