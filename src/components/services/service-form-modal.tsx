"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createService, updateService } from "@/app/app/services/actions";
import { SERVICE_CATEGORY_LABELS, SERVICE_UNITS } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/lib/types";

export function ServiceFormModal({
  open,
  onClose,
  service,
}: {
  open: boolean;
  onClose: () => void;
  service?: Service;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: service?.name ?? "",
    category: (service?.category ?? "plowing") as ServiceCategory,
    unit: service?.unit ?? SERVICE_UNITS[0],
    default_rate: service?.default_rate?.toString() ?? "0",
    description: service?.description ?? "",
    active: service?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const input = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit.trim() || "per visit",
      default_rate: Number(form.default_rate) || 0,
      description: form.description.trim() || null,
      active: form.active,
    };

    try {
      if (service) {
        await updateService(service.id, input);
      } else {
        await createService(input);
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
    <Modal open={open} onClose={onClose} title={service ? "Edit service" : "New service"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <Label htmlFor="name">Service name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Plowing - Per Push"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value as ServiceCategory)}
            >
              {Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              list="service-units"
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
            />
            <datalist id="service-units">
              {SERVICE_UNITS.map((unit) => (
                <option key={unit} value={unit} />
              ))}
            </datalist>
          </div>
        </div>
        <div>
          <Label htmlFor="default_rate">Default rate ($)</Label>
          <Input
            id="default_rate"
            type="number"
            min={0}
            step="0.01"
            value={form.default_rate}
            onChange={(e) => set("default_rate", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[var(--primary)]"
          />
          Active — show on new estimates &amp; proposals
        </label>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : service ? "Save changes" : "Add service"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
