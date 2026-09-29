import { redirect } from "next/navigation";
import { TeamList } from "@/components/team/team-list";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <TeamList profiles={(profiles as Profile[] | null) ?? []} currentUserId={user.id} />
  );
}
