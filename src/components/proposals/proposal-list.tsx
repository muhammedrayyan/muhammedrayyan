"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatCurrency, PROPOSAL_STATUS_STYLES } from "@/lib/utils";
import type { ProposalWithRelations } from "@/lib/types";

export function ProposalList({ proposals }: { proposals: ProposalWithRelations[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return proposals.filter((proposal) => {
      if (status !== "all" && proposal.status !== status) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [proposal.number, proposal.contact?.name, proposal.property?.label]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [proposals, query, status]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proposals</h1>
          <p className="mt-1 text-sm text-muted">
            {proposals.length} {proposals.length === 1 ? "proposal" : "proposals"} in your workspace
          </p>
        </div>
        <Link href="/app/proposals/new">
          <Button>
            <Plus size={16} /> New proposal
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
            placeholder="Search proposals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All statuses</option>
          {Object.entries(PROPOSAL_STATUS_STYLES).map(([value, style]) => (
            <option key={value} value={value}>
              {style.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            {proposals.length === 0
              ? "No proposals yet. Convert an estimate or start a new one."
              : "No proposals match your filters."}
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
              {filtered.map((proposal) => {
                const style = PROPOSAL_STATUS_STYLES[proposal.status];
                return (
                  <tr key={proposal.id} className="border-b border-border last:border-0 hover:bg-[#faf9fd]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/app/proposals/${proposal.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {proposal.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{proposal.contact?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{proposal.property?.label ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge className={style.badge}>{style.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">{proposal.valid_until ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatCurrency(proposal.total)}
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
