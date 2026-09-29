"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ServiceCategory } from "@/lib/types";

export type ServiceInput = {
  name: string;
  category: ServiceCategory;
  unit: string;
  default_rate: number;
  description: string | null;
  active: boolean;
};

export async function createService(input: ServiceInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("services")
    .insert({ ...input, created_by: user?.id ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/app/services");
  return data;
}

export async function updateService(id: string, input: ServiceInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").update(input).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/services");
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/services");
}
