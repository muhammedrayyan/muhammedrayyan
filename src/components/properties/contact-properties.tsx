"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Snowflake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyFormModal } from "@/components/properties/property-form-modal";
import { deleteProperty } from "@/app/app/properties/actions";
import { PROPERTY_TYPE_LABELS } from "@/lib/utils";
import type { Property } from "@/lib/types";

export function ContactProperties({
  contactId,
  properties,
}: {
  contactId: string;
  properties: Property[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNew() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(property: Property) {
    setEditing(property);
    setModalOpen(true);
  }

  async function handleDelete(property: Property) {
    if (!confirm(`Remove property "${property.label}"?`)) return;
    setDeletingId(property.id);
    try {
      await deleteProperty(property.id, contactId);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Properties ({properties.length})
        </h2>
        <Button variant="secondary" size="sm" onClick={openNew}>
          <Plus size={14} /> Add property
        </Button>
      </div>

      {properties.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
          No service sites on file yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-muted" />
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {property.label}
                      <Badge>{PROPERTY_TYPE_LABELS[property.property_type]}</Badge>
                      {property.salt_sensitive && (
                        <Badge className="bg-sky-100 text-sky-700">
                          <Snowflake size={11} /> Salt-sensitive
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-muted">
                      {[property.address_line1, property.city, property.state, property.postal_code]
                        .filter(Boolean)
                        .join(", ") || "No address on file"}
                    </p>
                    {property.access_notes && (
                      <p className="mt-1 text-xs text-muted">{property.access_notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(property)}
                    className="rounded-md p-1.5 text-muted hover:bg-[#efedf8] hover:text-foreground cursor-pointer"
                    aria-label="Edit property"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(property)}
                    disabled={deletingId === property.id}
                    className="rounded-md p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600 cursor-pointer disabled:opacity-50"
                    aria-label="Delete property"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PropertyFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        contactId={contactId}
        property={editing}
      />
    </div>
  );
}
