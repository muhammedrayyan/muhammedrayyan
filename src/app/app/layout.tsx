import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Project } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("projects").select("*").order("created_at", { ascending: true }),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        profile={profile as Profile | null}
        projects={(projects as Project[] | null) ?? []}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
