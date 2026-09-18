"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-white/10 hover:text-sidebar-foreground cursor-pointer"
      title="Sign out"
      aria-label="Sign out"
    >
      <LogOut size={16} />
    </button>
  );
}
