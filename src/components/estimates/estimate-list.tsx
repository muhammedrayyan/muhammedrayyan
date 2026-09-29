"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ESTIMATE_STATUS_STYLES, formatCurrency } from "@/lib/utils";
import type { EstimateWithRelations } from "@/lib/types";

export function EstimateList({ estimates }: { estimates: EstimateWithRelations[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return estimates.filter((estimate) => {
      if (status !== "all" && estimate.status !== status) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [estimate.number, estimate.contact?.name, estimate.property?.label]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [estimates, query, status]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Estimates</h1>
          <p className="mt-1 text-sm text-muted">
            {estimates.length} {estimates.length === 1 ? "estimate" : "estimates"} in your workspace
          </p>
        </div>
        <Link href="/app/estimates/new">
          <Button>
            <Plus size={16} /> New estimate
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex max-w-lg gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            placeholder="Search estimates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All statuses</option>
          {Object.entries(ESTIMATE_STATUS_STYLES).map(([value, style]) => (
            <option key={value} value={value}>
              {style.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            {estimates.length === 0
              ? "No estimates yet. Create your first one to send to a customer."
              : "No estimates match your filters."}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Number</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Valid until</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((estimate) => {
                const style = ESTIMATE_STATUS_STYLES[estimate.status];
                return (
                  <tr key={estimate.id} className="border-b border-border last:border-0 hover:bg-[#faf9fd]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/app/estimates/${estimate.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {estimate.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{estimate.contact?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{estimate.property?.label ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge className={style.badge}>{style.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">{estimate.valid_until ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatCurrency(estimate.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
