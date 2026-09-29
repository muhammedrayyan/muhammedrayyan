import Link from "next/link";
import { notFound } from "next/navigation";
import { EstimateEditor } from "@/components/estimates/estimate-editor";
import { EstimateDetailActions } from "@/components/estimates/estimate-detail-actions";
import { Badge } from "@/components/ui/badge";
import { ESTIMATE_STATUS_STYLES } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type {
  Contact,
  Estimate,
  EstimateLineItem,
  Property,
  Proposal,
  Service,
} from "@/lib/types";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: estimate },
    { data: lineItems },
    { data: contacts },
    { data: properties },
    { data: services },
    { data: proposals },
  ] = await Promise.all([
    supabase.from("estimates").select("*").eq("id", id).single(),
    supabase
      .from("estimate_line_items")
      .select("*")
      .eq("estimate_id", id)
      .order("position", { ascending: true }),
    supabase.from("contacts").select("id, name, company").order("name", { ascending: true }),
    supabase.from("properties").select("*").order("label", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("proposals").select("id, number, status").eq("estimate_id", id),
  ]);

  if (!estimate) notFound();

  const typedEstimate = estimate as Estimate;
  const style = ESTIMATE_STATUS_STYLES[typedEstimate.status];
  const linkedProposals = (proposals as Pick<Proposal, "id" | "number" | "status">[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/app/estimates" className="text-sm text-muted hover:text-foreground">
          ← All estimates
        </Link>
        <EstimateDetailActions estimate={typedEstimate} />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{typedEstimate.number}</h1>
        <Badge className={style.badge}>{style.label}</Badge>
      </div>

      {linkedProposals.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-[#faf9fd] px-4 py-3 text-sm">
          <span className="text-muted">Proposals from this estimate: </span>
          {linkedProposals.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <Link href={`/app/proposals/${p.id}`} className="font-medium text-primary hover:underline">
                {p.number}
              </Link>
            </span>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EstimateEditor
          contacts={(contacts as Pick<Contact, "id" | "name" | "company">[] | null) ?? []}
          properties={(properties as Property[] | null) ?? []}
          services={(services as Service[] | null) ?? []}
          estimate={typedEstimate}
          estimateLineItems={(lineItems as EstimateLineItem[] | null) ?? []}
        />
      </div>
    </div>
  );
}
