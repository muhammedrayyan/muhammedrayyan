import { ProposalList } from "@/components/proposals/proposal-list";
import { createClient } from "@/lib/supabase/server";
import type { ProposalWithRelations } from "@/lib/types";

export default async function ProposalsPage() {
  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, contact:contacts(id, name, company), property:properties(id, label)")
    .order("created_at", { ascending: false });

  return <ProposalList proposals={(proposals as unknown as ProposalWithRelations[] | null) ?? []} />;
}
