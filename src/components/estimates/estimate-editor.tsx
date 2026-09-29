"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { LineItemsEditor, type LineItemDraft } from "@/components/shared/line-items-editor";
import { createEstimate, updateEstimate } from "@/app/app/estimates/actions";
import type { Contact, Estimate, EstimateLineItem, Property, Service } from "@/lib/types";

type ContactOption = Pick<Contact, "id" | "name" | "company">;

export function EstimateEditor({
  contacts,
  properties,
  services,
  estimate,
  estimateLineItems,
  defaultContactId,
}: {
  contacts: ContactOption[];
  properties: Property[];
  services: Service[];
  estimate?: Estimate;
  estimateLineItems?: EstimateLineItem[];
  defaultContactId?: string;
}) {
  const router = useRouter();
  const [contactId, setContactId] = useState(estimate?.contact_id ?? defaultContactId ?? "");
  const [propertyId, setPropertyId] = useState(estimate?.property_id ?? "");
  const [season, setSeason] = useState(estimate?.season ?? "");
  const [validUntil, setValidUntil] = useState(estimate?.valid_until ?? "");
  const [taxRate, setTaxRate] = useState(estimate?.tax_rate ?? 0);
  const [notes, setNotes] = useState(estimate?.notes ?? "");
  const [terms, setTerms] = useState(
    estimate?.terms ?? "Estimate valid for 30 days. Pricing based on average seasonal snowfall.",
  );
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(
    (estimateLineItems ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        key: item.id,
        service_id: item.service_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
      })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propertyOptions = useMemo(
    () => properties.filter((p) => p.contact_id === contactId),
    [properties, contactId],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contactId) {
      setError("Choose a customer");
      return;
    }
    setSaving(true);
    setError(null);

    const input = {
      contact_id: contactId,
      property_id: propertyId || null,
      season: season.trim() || null,
      valid_until: validUntil || null,
      tax_rate: taxRate,
      notes: notes.trim() || null,
      terms: terms.trim() || null,
      line_items: lineItems.map((item) => ({
        service_id: item.service_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
      })),
    };

    try {
      if (estimate) {
        await updateEstimate(estimate.id, input);
        router.refresh();
      } else {
        const created = await createEstimate(input);
        router.push(`/app/estimates/${created.id}`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="contact">Customer</Label>
          <Select
            id="contact"
            required
            value={contactId}
            onChange={(e) => {
              setContactId(e.target.value);
              setPropertyId("");
            }}
          >
            <option value="" disabled>
              Select a customer…
            </option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="property">Property</Label>
          <Select
            id="property"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            disabled={!contactId}
          >
            <option value="">No specific property</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="season">Season</Label>
          <Input
            id="season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="2026-2027"
          />
        </div>
        <div>
          <Label htmlFor="valid_until">Valid until</Label>
          <Input
            id="valid_until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
      </div>

      <LineItemsEditor
        services={services}
        lineItems={lineItems}
        onChange={setLineItems}
        taxRate={taxRate}
        onTaxRateChange={setTaxRate}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="notes">Internal notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Not shown to the customer"
          />
        </div>
        <div>
          <Label htmlFor="terms">Terms</Label>
          <Textarea
            id="terms"
            rows={3}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(estimate ? `/app/estimates/${estimate.id}` : "/app/estimates")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : estimate ? "Save changes" : "Create estimate"}
        </Button>
      </div>
    </form>
  );
}
