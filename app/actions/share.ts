"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";

export async function createShareLink(
  propertyId: string
): Promise<{ slug: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const slug = nanoid(10);
  const { error } = await supabase.from("share_links").insert({
    slug,
    property_id: propertyId,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/saved");
  return { slug };
}

export async function deleteShareLink(linkId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("share_links")
    .delete()
    .eq("id", linkId)
    .eq("created_by", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/saved");
}
