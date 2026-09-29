"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceFormModal } from "@/components/services/service-form-modal";
import { deleteService } from "@/app/app/services/actions";
import { formatCurrency, SERVICE_CATEGORY_LABELS } from "@/lib/utils";
import type { Service } from "@/lib/types";

export function ServiceList({ services }: { services: Service[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNew() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setModalOpen(true);
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Delete "${service.name}" from the price list?`)) return;
    setDeletingId(service.id);
    try {
      await deleteService(service.id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="mt-1 text-sm text-muted">
            Your snow &amp; ice price list — pull these straight into estimates and proposals.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} /> New service
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {services.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            No services yet. Add your first line-item template.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Unit</th>
                <th className="px-5 py-3 font-medium">Rate</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-border last:border-0 hover:bg-[#faf9fd]">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-muted">{service.description}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {SERVICE_CATEGORY_LABELS[service.category]}
                  </td>
                  <td className="px-5 py-3 text-muted">{service.unit}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(service.default_rate)}</td>
                  <td className="px-5 py-3">
                    {service.active ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                    ) : (
                      <Badge>Inactive</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(service)}
                        className="rounded-md p-1.5 text-muted hover:bg-[#efedf8] hover:text-foreground cursor-pointer"
                        aria-label="Edit service"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        disabled={deletingId === service.id}
                        className="rounded-md p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600 cursor-pointer disabled:opacity-50"
                        aria-label="Delete service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ServiceFormModal open={modalOpen} onClose={() => setModalOpen(false)} service={editing} />
    </div>
  );
}
