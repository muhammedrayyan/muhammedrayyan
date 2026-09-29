"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeTotals } from "@/lib/utils";
import type { LineItemInput } from "@/lib/types";

export type ProposalInput = {
  contact_id: string;
  property_id: string | null;
  valid_until: string | null;
  tax_rate: number;
  notes: string | null;
  terms: string | null;
  line_items: LineItemInput[];
};

export async function createProposal(input: ProposalInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { subtotal, taxAmount, total } = computeTotals(input.line_items, input.tax_rate);

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      contact_id: input.contact_id,
      property_id: input.property_id,
      valid_until: input.valid_until,
      tax_rate: input.tax_rate,
      notes: input.notes,
      terms: input.terms,
      subtotal,
      tax_amount: taxAmount,
      total,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.line_items.length > 0) {
    const { error: lineError } = await supabase.from("proposal_line_items").insert(
      input.line_items.map((item, index) => ({
        proposal_id: proposal.id,
        service_id: item.service_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        position: index,
      })),
    );
    if (lineError) throw new Error(lineError.message);
  }

  revalidatePath("/app/proposals");
  revalidatePath("/app");
  return proposal;
}

export async function updateProposal(id: string, input: ProposalInput) {
  const supabase = await createClient();
  const { subtotal, taxAmount, total } = computeTotals(input.line_items, input.tax_rate);

  const { error } = await supabase
    .from("proposals")
    .update({
      contact_id: input.contact_id,
      property_id: input.property_id,
      valid_until: input.valid_until,
      tax_rate: input.tax_rate,
      notes: input.notes,
      terms: input.terms,
      subtotal,
      tax_amount: taxAmount,
      total,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const { error: deleteError } = await supabase
    .from("proposal_line_items")
    .delete()
    .eq("proposal_id", id);
  if (deleteError) throw new Error(deleteError.message);

  if (input.line_items.length > 0) {
    const { error: lineError } = await supabase.from("proposal_line_items").insert(
      input.line_items.map((item, index) => ({
        proposal_id: id,
        service_id: item.service_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        position: index,
      })),
    );
    if (lineError) throw new Error(lineError.message);
  }

  revalidatePath("/app/proposals");
  revalidatePath(`/app/proposals/${id}`);
}

export async function sendProposal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/proposals");
  revalidatePath(`/app/proposals/${id}`);
}

export async function acceptProposal(id: string, signedBy: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      signed_by: signedBy,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/proposals");
  revalidatePath(`/app/proposals/${id}`);
}

export async function declineProposal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({ status: "declined", declined_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/proposals");
  revalidatePath(`/app/proposals/${id}`);
}

export async function deleteProposal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("proposals").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/proposals");
  revalidatePath("/app");
}
