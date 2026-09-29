"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "@/components/team/profile-edit-modal";
import type { Profile } from "@/lib/types";

export function TeamList({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const me = profiles.find((p) => p.id === currentUserId);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="mt-1 text-sm text-muted">
            {profiles.length} {profiles.length === 1 ? "member" : "members"} with access to this
            workspace.
          </p>
        </div>
        {me && (
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Edit my profile
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="divide-y divide-border">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3 px-5 py-3.5">
              <Avatar name={profile.full_name} color={profile.avatar_color} size={36} />
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {profile.full_name ?? "Unnamed"}
                </div>
                <div className="text-xs text-muted">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
              {profile.id === currentUserId && <Badge>You</Badge>}
            </div>
          ))}
        </div>
      </div>

      {me && <ProfileEditModal open={editOpen} onClose={() => setEditOpen(false)} profile={me} />}
    </div>
  );
}
