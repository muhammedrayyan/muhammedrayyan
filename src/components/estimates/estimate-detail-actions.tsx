"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileOutput, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { convertEstimateToProposal, deleteEstimate, updateEstimateStatus } from "@/app/app/estimates/actions";
import { ESTIMATE_STATUS_STYLES } from "@/lib/utils";
import type { Estimate, EstimateStatus } from "@/lib/types";

export function EstimateDetailActions({ estimate }: { estimate: Estimate }) {
  const router = useRouter();
  const [status, setStatus] = useState<EstimateStatus>(estimate.status);
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(next: EstimateStatus) {
    setStatus(next);
    setUpdating(true);
    try {
      await updateEstimateStatus(estimate.id, next);
      router.refresh();
    } finally {
      setUpdating(false);
    }
  }

  async function handleConvert() {
    setConverting(true);
    try {
      await convertEstimateToProposal(estimate.id);
    } finally {
      setConverting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete estimate ${estimate.number}? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await deleteEstimate(estimate.id);
      router.push("/app/estimates");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as EstimateStatus)}
        disabled={updating}
        className="h-9 w-36"
      >
        {Object.entries(ESTIMATE_STATUS_STYLES).map(([value, style]) => (
          <option key={value} value={value}>
            {style.label}
          </option>
        ))}
      </Select>
      <Button variant="secondary" size="sm" onClick={handleConvert} disabled={converting}>
        <FileOutput size={14} /> {converting ? "Converting…" : "Convert to proposal"}
      </Button>
      <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
        <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
      </Button>
    </div>
  );
}
