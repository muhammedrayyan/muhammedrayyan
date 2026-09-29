import { ServiceList } from "@/components/services/service-list";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return <ServiceList services={(services as Service[] | null) ?? []} />;
}
