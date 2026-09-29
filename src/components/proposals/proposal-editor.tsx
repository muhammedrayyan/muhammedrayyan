"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { LineItemsEditor, type LineItemDraft } from "@/components/shared/line-items-editor";
import { createProposal, updateProposal } from "@/app/app/proposals/actions";
import type { Contact, Property, Proposal, ProposalLineItem, Service } from "@/lib/types";

type ContactOption = Pick<Contact, "id" | "name" | "company">;

export function ProposalEditor({
  contacts,
  properties,
  services,
  proposal,
  proposalLineItems,
  defaultContactId,
  readOnly = false,
}: {
  contacts: ContactOption[];
  properties: Property[];
  services: Service[];
  proposal?: Proposal;
  proposalLineItems?: ProposalLineItem[];
  defaultContactId?: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [contactId, setContactId] = useState(proposal?.contact_id ?? defaultContactId ?? "");
  const [propertyId, setPropertyId] = useState(proposal?.property_id ?? "");
  const [validUntil, setValidUntil] = useState(proposal?.valid_until ?? "");
  const [taxRate, setTaxRate] = useState(proposal?.tax_rate ?? 0);
  const [notes, setNotes] = useState(proposal?.notes ?? "");
  const [terms, setTerms] = useState(
    proposal?.terms ?? "Proposal valid for 30 days from send date. 50% deposit due on acceptance.",
  );
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(
    (proposalLineItems ?? [])
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
      if (proposal) {
        await updateProposal(proposal.id, input);
        router.refresh();
      } else {
        const created = await createProposal(input);
        router.push(`/app/proposals/${created.id}`);
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
      <fieldset disabled={readOnly} className="flex flex-col gap-5">
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
              disabled={!contactId || readOnly}
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

        <div>
          <Label htmlFor="valid_until">Valid until</Label>
          <Input
            id="valid_until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="max-w-xs"
          />
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
            <Textarea id="terms" rows={3} value={terms} onChange={(e) => setTerms(e.target.value)} />
          </div>
        </div>
      </fieldset>

      {error && <p className="text-sm text-rose-500">{error}</p>}
      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(proposal ? `/app/proposals/${proposal.id}` : "/app/proposals")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : proposal ? "Save changes" : "Create proposal"}
          </Button>
        </div>
      )}
    </form>
  );
}
