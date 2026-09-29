"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Printer, Send, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  acceptProposal,
  declineProposal,
  deleteProposal,
  sendProposal,
} from "@/app/app/proposals/actions";
import type { Proposal } from "@/lib/types";

export function ProposalDetailActions({ proposal }: { proposal: Proposal }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signedBy, setSignedBy] = useState("");

  async function handleSend() {
    setBusy(true);
    try {
      await sendProposal(proposal.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept() {
    if (!signedBy.trim()) return;
    setBusy(true);
    try {
      await acceptProposal(proposal.id, signedBy.trim());
      setSigning(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline() {
    if (!confirm("Mark this proposal as declined?")) return;
    setBusy(true);
    try {
      await declineProposal(proposal.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete proposal ${proposal.number}? This can't be undone.`)) return;
    setBusy(true);
    try {
      await deleteProposal(proposal.id);
      router.push("/app/proposals");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer size={14} /> Print
        </Button>
        {proposal.status === "draft" && (
          <Button size="sm" onClick={handleSend} disabled={busy}>
            <Send size={14} /> {busy ? "Sending…" : "Mark as sent"}
          </Button>
        )}
        {(proposal.status === "draft" || proposal.status === "sent") && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSigning((v) => !v)}
              disabled={busy}
            >
              <CheckCircle2 size={14} /> Mark accepted
            </Button>
            <Button variant="danger" size="sm" onClick={handleDecline} disabled={busy}>
              <XCircle size={14} /> Mark declined
            </Button>
          </>
        )}
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={busy}>
          <Trash2 size={14} /> Delete
        </Button>
      </div>
      {signing && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
          <Input
            placeholder="Customer's printed name"
            value={signedBy}
            onChange={(e) => setSignedBy(e.target.value)}
            className="h-9 w-56"
          />
          <Button size="sm" onClick={handleAccept} disabled={busy || !signedBy.trim()}>
            Confirm acceptance
          </Button>
        </div>
      )}
    </div>
  );
}
