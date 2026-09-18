import { ContactList } from "@/components/contacts/contact-list";
import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return <ContactList contacts={(contacts as Contact[] | null) ?? []} />;
}
