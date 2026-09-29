"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PropertyType } from "@/lib/types";

export type PropertyInput = {
  contact_id: string;
  label: string;
  property_type: PropertyType;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  surface_type: string | null;
  square_footage: number | null;
  salt_sensitive: boolean;
  gate_code: string | null;
  access_notes: string | null;
};

export async function createProperty(input: PropertyInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("properties")
    .insert({ ...input, created_by: user?.id ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/app/properties");
  revalidatePath(`/app/contacts/${input.contact_id}`);
  revalidatePath("/app");
  return data;
}

export async function updateProperty(id: string, input: PropertyInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").update(input).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/properties");
  revalidatePath(`/app/contacts/${input.contact_id}`);
}

export async function deleteProperty(id: string, contactId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/properties");
  revalidatePath(`/app/contacts/${contactId}`);
}
