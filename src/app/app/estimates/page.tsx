import { EstimateList } from "@/components/estimates/estimate-list";
import { createClient } from "@/lib/supabase/server";
import type { EstimateWithRelations } from "@/lib/types";

export default async function EstimatesPage() {
  const supabase = await createClient();
  const { data: estimates } = await supabase
    .from("estimates")
    .select("*, contact:contacts(id, name, company), property:properties(id, label)")
    .order("created_at", { ascending: false });

  return <EstimateList estimates={(estimates as unknown as EstimateWithRelations[] | null) ?? []} />;
}
