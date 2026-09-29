"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { updateOwnProfile } from "@/app/app/team/actions";
import { PROJECT_COLORS } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function ProfileEditModal({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [color, setColor] = useState(profile.avatar_color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateOwnProfile({ full_name: fullName.trim(), avatar_color: color });
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit your profile">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={fullName} color={color} size={44} />
          <div className="flex-1">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Avatar color</Label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full ring-offset-2"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                }}
                aria-label={`Choose ${c}`}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
