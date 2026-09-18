"use client";

import { useState, type FormEvent } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { Profile, TaskPriority, TaskStatus, TaskWithRelations } from "@/lib/types";

type ContactOption = { id: string; name: string };

export type TaskPanelSubmitInput = {
  title: string;
  description: string | null;
  status_id: string;
  priority: TaskPriority;
  assignee_id: string | null;
  contact_id: string | null;
  due_date: string | null;
};

export function TaskPanel({
  open,
  onClose,
  task,
  defaultStatusId,
  statuses,
  profiles,
  contacts,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  task: TaskWithRelations | null;
  defaultStatusId?: string;
  statuses: TaskStatus[];
  profiles: Profile[];
  contacts: ContactOption[];
  onSubmit: (input: TaskPanelSubmitInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<TaskPanelSubmitInput>(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status_id: task?.status_id ?? defaultStatusId ?? statuses[0]?.id ?? "",
    priority: task?.priority ?? "normal",
    assignee_id: task?.assignee_id ?? null,
    contact_id: task?.contact_id ?? null,
    due_date: task?.due_date ?? null,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Delete this task?")) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]">
      <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">{task ? "Edit task" : "New task"}</h2>
          <div className="flex items-center gap-1">
            {task && onDelete && (
              <button
                onClick={handleDelete}
                className="rounded-md p-1.5 text-muted hover:bg-rose-50 hover:text-rose-500 cursor-pointer"
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted hover:bg-[#efedf8] hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
          <div>
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Follow up with client"
            />
          </div>

          <div>
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Add more detail…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                value={form.status_id}
                onChange={(e) => setForm((f) => ({ ...f, status_id: e.target.value }))}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                id="task-priority"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-assignee">Assignee</Label>
              <Select
                id="task-assignee"
                value={form.assignee_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignee_id: e.target.value || null }))
                }
              >
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name ?? "Unnamed"}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.due_date ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, due_date: e.target.value || null }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="task-contact">Linked contact</Label>
            <Select
              id="task-contact"
              value={form.contact_id ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, contact_id: e.target.value || null }))
              }
            >
              <option value="">No contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="mt-auto flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.title.trim()}>
              {saving ? "Saving…" : task ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
