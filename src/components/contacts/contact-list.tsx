"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactFormModal } from "@/components/contacts/contact-form-modal";
import type { Contact } from "@/lib/types";

const AVATAR_COLORS = ["#7B68EE", "#F76B8A", "#2FB7B0", "#F2994A", "#5B8DEF", "#A67BF2"];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function ContactList({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.email, c.company, c.title]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [contacts, query]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="mt-1 text-sm text-muted">
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"} in your workspace
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New contact
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            placeholder="Search contacts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            {contacts.length === 0
              ? "No contacts yet. Add your first one to get started."
              : "No contacts match your search."}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-[#faf9fd]">
                  <td className="px-5 py-3">
                    <Link
                      href={`/app/contacts/${contact.id}`}
                      className="flex items-center gap-3 font-medium text-foreground"
                    >
                      <Avatar name={contact.name} color={colorFor(contact.id)} size={30} />
                      {contact.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{contact.company ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{contact.email ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{contact.phone ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ContactFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
