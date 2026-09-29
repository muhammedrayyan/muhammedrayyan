"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createProperty, updateProperty } from "@/app/app/properties/actions";
import { PROPERTY_TYPE_LABELS } from "@/lib/utils";
import type { Property, PropertyType } from "@/lib/types";

export function PropertyFormModal({
  open,
  onClose,
  contactId,
  property,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  contactId: string;
  property?: Property;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    label: property?.label ?? "",
    property_type: (property?.property_type ?? "residential") as PropertyType,
    address_line1: property?.address_line1 ?? "",
    address_line2: property?.address_line2 ?? "",
    city: property?.city ?? "",
    state: property?.state ?? "",
    postal_code: property?.postal_code ?? "",
    surface_type: property?.surface_type ?? "",
    square_footage: property?.square_footage?.toString() ?? "",
    salt_sensitive: property?.salt_sensitive ?? false,
    gate_code: property?.gate_code ?? "",
    access_notes: property?.access_notes ?? "",
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
      contact_id: contactId,
      label: form.label.trim(),
      property_type: form.property_type,
      address_line1: form.address_line1.trim() || null,
      address_line2: form.address_line2.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      postal_code: form.postal_code.trim() || null,
      surface_type: form.surface_type.trim() || null,
      square_footage: form.square_footage ? Number(form.square_footage) : null,
      salt_sensitive: form.salt_sensitive,
      gate_code: form.gate_code.trim() || null,
      access_notes: form.access_notes.trim() || null,
    };

    try {
      if (property) {
        await updateProperty(property.id, input);
      } else {
        await createProperty(input);
      }
      onSaved?.();
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
      title={property ? "Edit property" : "New property"}
      widthClassName="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="label">Property label</Label>
            <Input
              id="label"
              required
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="Main Lot, North Side…"
            />
          </div>
          <div>
            <Label htmlFor="property_type">Type</Label>
            <Select
              id="property_type"
              value={form.property_type}
              onChange={(e) => set("property_type", e.target.value as PropertyType)}
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="address_line1">Address line 1</Label>
          <Input
            id="address_line1"
            value={form.address_line1}
            onChange={(e) => set("address_line1", e.target.value)}
            placeholder="123 Main St"
          />
        </div>
        <div>
          <Label htmlFor="address_line2">Address line 2</Label>
          <Input
            id="address_line2"
            value={form.address_line2}
            onChange={(e) => set("address_line2", e.target.value)}
            placeholder="Suite / unit"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="postal_code">Postal code</Label>
            <Input
              id="postal_code"
              value={form.postal_code}
              onChange={(e) => set("postal_code", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="surface_type">Surface type</Label>
            <Input
              id="surface_type"
              value={form.surface_type}
              onChange={(e) => set("surface_type", e.target.value)}
              placeholder="Asphalt, concrete, gravel…"
            />
          </div>
          <div>
            <Label htmlFor="square_footage">Approx. square footage</Label>
            <Input
              id="square_footage"
              type="number"
              min={0}
              value={form.square_footage}
              onChange={(e) => set("square_footage", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="gate_code">Gate code</Label>
            <Input
              id="gate_code"
              value={form.gate_code}
              onChange={(e) => set("gate_code", e.target.value)}
            />
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.salt_sensitive}
                onChange={(e) => set("salt_sensitive", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-[var(--primary)]"
              />
              Salt-sensitive surface
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="access_notes">Access notes</Label>
          <Textarea
            id="access_notes"
            rows={2}
            value={form.access_notes}
            onChange={(e) => set("access_notes", e.target.value)}
            placeholder="Where to plow to, obstacles, contact on arrival…"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : property ? "Save changes" : "Add property"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
