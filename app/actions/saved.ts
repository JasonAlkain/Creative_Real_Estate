"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SavedStatus } from "@/types";
import { SAVED_STATUSES } from "@/lib/saved-status";

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

function revalidateSaved(propertyId: string) {
  revalidatePath("/", "layout");
  revalidatePath(`/property/${propertyId}`);
  revalidatePath("/saved");
}

export async function toggleSaved(
  propertyId: string
): Promise<{ saved: boolean }> {
  const { supabase, user } = await authedClient();

  const { data: existing } = await supabase
    .from("saved_properties")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    revalidateSaved(propertyId);
    return { saved: false };
  } else {
    const { error } = await supabase.from("saved_properties").insert({
      user_id: user.id,
      property_id: propertyId,
      status: "new" as SavedStatus,
    });
    if (error) throw new Error(error.message);
    revalidateSaved(propertyId);
    return { saved: true };
  }
}

export async function updateSavedStatus(
  propertyId: string,
  status: SavedStatus
): Promise<void> {
  if (!SAVED_STATUSES.includes(status)) throw new Error("Invalid status");
  const { supabase, user } = await authedClient();

  const { error } = await supabase
    .from("saved_properties")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("property_id", propertyId);
  if (error) throw new Error(error.message);
  revalidatePath("/saved");
  revalidatePath(`/property/${propertyId}`);
}

export async function updateSavedNotes(
  propertyId: string,
  notes: string
): Promise<void> {
  const { supabase, user } = await authedClient();

  const { error } = await supabase
    .from("saved_properties")
    .update({ notes: notes.trim() || null, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("property_id", propertyId);
  if (error) throw new Error(error.message);
  revalidatePath("/saved");
  revalidatePath(`/property/${propertyId}`);
}

export async function removeSaved(propertyId: string): Promise<void> {
  const { supabase, user } = await authedClient();

  const { error } = await supabase
    .from("saved_properties")
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", propertyId);
  if (error) throw new Error(error.message);
  revalidateSaved(propertyId);
}
