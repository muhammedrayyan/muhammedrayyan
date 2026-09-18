"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createProject } from "@/app/app/projects/actions";
import { PROJECT_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ProjectFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
      router.push(`/app/projects/${project.id}`);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <Label htmlFor="project-name">Project name</Label>
          <Input
            id="project-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Q3 Product Launch"
          />
        </div>
        <div>
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this project about?"
          />
        </div>
        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "h-7 w-7 rounded-full ring-offset-2 cursor-pointer",
                  color === c && "ring-2 ring-foreground",
                )}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
