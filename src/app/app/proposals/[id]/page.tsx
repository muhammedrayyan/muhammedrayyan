import Link from "next/link";
import { notFound } from "next/navigation";
import { ProposalEditor } from "@/components/proposals/proposal-editor";
import { ProposalDetailActions } from "@/components/proposals/proposal-detail-actions";
import { Badge } from "@/components/ui/badge";
import { PROPOSAL_STATUS_STYLES } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Contact, Estimate, Property, Proposal, ProposalLineItem, Service } from "@/lib/types";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: proposal },
    { data: lineItems },
    { data: contacts },
    { data: properties },
    { data: services },
  ] = await Promise.all([
    supabase.from("proposals").select("*, estimate:estimates(id, number)").eq("id", id).single(),
    supabase
      .from("proposal_line_items")
      .select("*")
      .eq("proposal_id", id)
      .order("position", { ascending: true }),
    supabase.from("contacts").select("id, name, company").order("name", { ascending: true }),
    supabase.from("properties").select("*").order("label", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (!proposal) notFound();

  const typedProposal = proposal as Proposal & { estimate: Pick<Estimate, "id" | "number"> | null };
  const style = PROPOSAL_STATUS_STYLES[typedProposal.status];
  const readOnly = typedProposal.status === "accepted" || typedProposal.status === "declined";

  return (
    <div className="mx-auto max-w-3xl p-8 print:max-w-none">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/app/proposals" className="text-sm text-muted hover:text-foreground">
          ← All proposals
        </Link>
        <ProposalDetailActions proposal={typedProposal} />
      </div>

      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{typedProposal.number}</h1>
        <Badge className={style.badge}>{style.label}</Badge>
      </div>

      {typedProposal.estimate && (
        <p className="mb-4 text-sm text-muted print:hidden">
          Generated from estimate{" "}
          <Link
            href={`/app/estimates/${typedProposal.estimate.id}`}
            className="font-medium text-primary hover:underline"
          >
            {typedProposal.estimate.number}
          </Link>
        </p>
      )}

      {typedProposal.status === "accepted" && typedProposal.signed_by && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Accepted by <strong>{typedProposal.signed_by}</strong>
          {typedProposal.accepted_at &&
            ` on ${new Date(typedProposal.accepted_at).toLocaleDateString()}`}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <ProposalEditor
          contacts={(contacts as Pick<Contact, "id" | "name" | "company">[] | null) ?? []}
          properties={(properties as Property[] | null) ?? []}
          services={(services as Service[] | null) ?? []}
          proposal={typedProposal}
          proposalLineItems={(lineItems as ProposalLineItem[] | null) ?? []}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
