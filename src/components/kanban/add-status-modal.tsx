"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PROJECT_COLORS } from "@/lib/utils";

export function AddStatusModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; color: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[4]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), color });
      setName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add status column" widthClassName="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <Label htmlFor="status-name">Column name</Label>
          <Input
            id="status-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Blocked"
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
                  "h-6 w-6 rounded-full cursor-pointer",
                  color === c && "ring-2 ring-foreground ring-offset-2",
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
            {saving ? "Adding…" : "Add column"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
