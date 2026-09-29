import { ProposalEditor } from "@/components/proposals/proposal-editor";
import { createClient } from "@/lib/supabase/server";
import type { Contact, Property, Service } from "@/lib/types";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string }>;
}) {
  const { contact } = await searchParams;
  const supabase = await createClient();

  const [{ data: contacts }, { data: properties }, { data: services }] = await Promise.all([
    supabase.from("contacts").select("id, name, company").order("name", { ascending: true }),
    supabase.from("properties").select("*").order("label", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">New proposal</h1>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <ProposalEditor
          contacts={(contacts as Pick<Contact, "id" | "name" | "company">[] | null) ?? []}
          properties={(properties as Property[] | null) ?? []}
          services={(services as Service[] | null) ?? []}
          defaultContactId={contact}
        />
      </div>
    </div>
  );
}
