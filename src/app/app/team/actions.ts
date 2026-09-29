"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOwnProfile(input: { full_name: string; avatar_color: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("profiles").update(input).eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/team");
  revalidatePath("/app", "layout");
}
