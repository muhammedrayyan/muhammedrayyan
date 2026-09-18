"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ContactInput = {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  notes: string | null;
  tags: string[];
};

export async function createContact(input: ContactInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...input, created_by: user?.id ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/app/contacts");
  revalidatePath("/app");
  return data;
}

export async function updateContact(id: string, input: ContactInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").update(input).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/contacts");
  revalidatePath(`/app/contacts/${id}`);
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/contacts");
  revalidatePath("/app");
}
