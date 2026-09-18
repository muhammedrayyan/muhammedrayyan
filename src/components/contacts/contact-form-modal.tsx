"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createContact, updateContact } from "@/app/app/contacts/actions";
import type { Contact } from "@/lib/types";

export function ContactFormModal({
  open,
  onClose,
  contact,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  contact?: Contact;
  onSaved?: (id: string) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: contact?.name ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    company: contact?.company ?? "",
    title: contact?.title ?? "",
    tags: contact?.tags?.join(", ") ?? "",
    notes: contact?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const input = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      title: form.title.trim() || null,
      notes: form.notes.trim() || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (contact) {
        await updateContact(contact.id, input);
        onSaved?.(contact.id);
      } else {
        const created = await createContact(input);
        onSaved?.(created.id);
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? "Edit contact" : "New contact"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@company.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 555 0100"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Head of Sales"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="lead, vip"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Anything worth remembering…"
          />
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : contact ? "Save changes" : "Create contact"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
