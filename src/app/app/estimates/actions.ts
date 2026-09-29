"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeTotals } from "@/lib/utils";
import type { EstimateStatus, LineItemInput } from "@/lib/types";

export type EstimateInput = {
  contact_id: string;
  property_id: string | null;
  season: string | null;
  valid_until: string | null;
  tax_rate: number;
  notes: string | null;
  terms: string | null;
  line_items: LineItemInput[];
};

export async function createEstimate(input: EstimateInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { subtotal, taxAmount, total } = computeTotals(input.line_items, input.tax_rate);

  const { data: estimate, error } = await supabase
    .from("estimates")
    .insert({
      contact_id: input.contact_id,
      property_id: input.property_id,
      season: input.season,
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
    const { error: lineError } = await supabase.from("estimate_line_items").insert(
      input.line_items.map((item, index) => ({
        estimate_id: estimate.id,
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

  revalidatePath("/app/estimates");
  revalidatePath("/app");
  return estimate;
}

export async function updateEstimate(id: string, input: EstimateInput) {
  const supabase = await createClient();
  const { subtotal, taxAmount, total } = computeTotals(input.line_items, input.tax_rate);

  const { error } = await supabase
    .from("estimates")
    .update({
      contact_id: input.contact_id,
      property_id: input.property_id,
      season: input.season,
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
    .from("estimate_line_items")
    .delete()
    .eq("estimate_id", id);
  if (deleteError) throw new Error(deleteError.message);

  if (input.line_items.length > 0) {
    const { error: lineError } = await supabase.from("estimate_line_items").insert(
      input.line_items.map((item, index) => ({
        estimate_id: id,
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

  revalidatePath("/app/estimates");
  revalidatePath(`/app/estimates/${id}`);
}

export async function updateEstimateStatus(id: string, status: EstimateStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("estimates").update({ status }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/estimates");
  revalidatePath(`/app/estimates/${id}`);
}

export async function deleteEstimate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("estimates").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/app/estimates");
  revalidatePath("/app");
}

export async function convertEstimateToProposal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: estimate, error: estError }, { data: lineItems, error: lineError }] =
    await Promise.all([
      supabase.from("estimates").select("*").eq("id", id).single(),
      supabase
        .from("estimate_line_items")
        .select("*")
        .eq("estimate_id", id)
        .order("position", { ascending: true }),
    ]);

  if (estError) throw new Error(estError.message);
  if (lineError) throw new Error(lineError.message);
  if (!estimate) throw new Error("Estimate not found");

  const { data: proposal, error: createError } = await supabase
    .from("proposals")
    .insert({
      estimate_id: estimate.id,
      contact_id: estimate.contact_id,
      property_id: estimate.property_id,
      valid_until: estimate.valid_until,
      notes: estimate.notes,
      terms: estimate.terms,
      tax_rate: estimate.tax_rate,
      subtotal: estimate.subtotal,
      tax_amount: estimate.tax_amount,
      total: estimate.total,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (createError) throw new Error(createError.message);

  const items = lineItems ?? [];
  if (items.length > 0) {
    const { error: insertError } = await supabase.from("proposal_line_items").insert(
      items.map((item) => ({
        proposal_id: proposal.id,
        service_id: item.service_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        position: item.position,
      })),
    );
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath("/app/estimates");
  revalidatePath("/app/proposals");
  redirect(`/app/proposals/${proposal.id}`);
}
