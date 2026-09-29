"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { computeTotals, formatCurrency } from "@/lib/utils";
import type { LineItemInput, Service } from "@/lib/types";

export type LineItemDraft = LineItemInput & { key: string };

let draftCounter = 0;
export function newLineItemKey() {
  draftCounter += 1;
  return `draft-${Date.now()}-${draftCounter}`;
}

export function LineItemsEditor({
  services,
  lineItems,
  onChange,
  taxRate,
  onTaxRateChange,
}: {
  services: Service[];
  lineItems: LineItemDraft[];
  onChange: (items: LineItemDraft[]) => void;
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
}) {
  const { subtotal, taxAmount, total } = computeTotals(lineItems, taxRate);

  function addLine() {
    onChange([
      ...lineItems,
      {
        key: newLineItemKey(),
        service_id: null,
        description: "",
        quantity: 1,
        unit: null,
        unit_price: 0,
      },
    ]);
  }

  function updateLine(key: string, patch: Partial<LineItemDraft>) {
    onChange(lineItems.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeLine(key: string) {
    onChange(lineItems.filter((item) => item.key !== key));
  }

  function applyService(key: string, serviceId: string) {
    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      updateLine(key, { service_id: null });
      return;
    }
    updateLine(key, {
      service_id: service.id,
      description: service.name,
      unit: service.unit,
      unit_price: service.default_rate,
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">Line items</span>
        <Button type="button" variant="secondary" size="sm" onClick={addLine}>
          <Plus size={14} /> Add line
        </Button>
      </div>

      {lineItems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted">
          No line items yet — add a service or custom line.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-[#faf9fd] text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">Service</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="w-20 px-3 py-2 font-medium">Qty</th>
                <th className="w-28 px-3 py-2 font-medium">Unit</th>
                <th className="w-28 px-3 py-2 font-medium">Rate</th>
                <th className="w-24 px-3 py-2 text-right font-medium">Amount</th>
                <th className="w-8 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.key} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 align-top">
                    <Select
                      value={item.service_id ?? ""}
                      onChange={(e) => applyService(item.key, e.target.value)}
                      className="h-9"
                    >
                      <option value="">Custom</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Input
                      required
                      value={item.description}
                      onChange={(e) => updateLine(item.key, { description: e.target.value })}
                      placeholder="Line description"
                      className="h-9"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLine(item.key, { quantity: Number(e.target.value) || 0 })
                      }
                      className="h-9"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Input
                      value={item.unit ?? ""}
                      onChange={(e) => updateLine(item.key, { unit: e.target.value || null })}
                      className="h-9"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateLine(item.key, { unit_price: Number(e.target.value) || 0 })
                      }
                      className="h-9"
                    />
                  </td>
                  <td className="px-3 py-2 text-right align-top font-medium">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                  <td className="px-2 py-2 text-right align-top">
                    <button
                      type="button"
                      onClick={() => removeLine(item.key)}
                      className="rounded-md p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      aria-label="Remove line"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="ml-auto mt-3 flex max-w-xs flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-muted">
          <span className="flex items-center gap-2">
            Tax rate
            <Input
              type="number"
              min={0}
              step="0.01"
              value={taxRate}
              onChange={(e) => onTaxRateChange(Number(e.target.value) || 0)}
              className="h-7 w-16 px-2 text-xs"
            />
            %
          </span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-1.5 font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
