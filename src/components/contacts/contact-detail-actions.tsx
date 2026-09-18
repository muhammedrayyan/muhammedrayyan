"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormModal } from "@/components/contacts/contact-form-modal";
import { deleteContact } from "@/app/app/contacts/actions";
import type { Contact } from "@/lib/types";

export function ContactDetailActions({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete ${contact.name}? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await deleteContact(contact.id);
      router.push("/app/contacts");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil size={14} /> Edit
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
          <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
      <ContactFormModal open={editOpen} onClose={() => setEditOpen(false)} contact={contact} />
    </>
  );
}
