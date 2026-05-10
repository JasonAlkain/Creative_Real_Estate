import { createClient } from "@/lib/supabase/server";
import type { Property, PropertyFilters } from "@/types";

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<Property[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*")
    .eq("is_active", true);

  if (filters.price_min !== undefined)
    query = query.gte("price", filters.price_min);
  if (filters.price_max !== undefined)
    query = query.lte("price", filters.price_max);
  if (filters.beds_min !== undefined)
    query = query.gte("beds", filters.beds_min);
  if (filters.baths_min !== undefined)
    query = query.gte("baths", filters.baths_min);
  if (filters.sqft_min !== undefined)
    query = query.gte("sqft", filters.sqft_min);
  if (filters.sqft_max !== undefined)
    query = query.lte("sqft", filters.sqft_max);
  if (filters.financing_types?.length)
    query = query.overlaps("financing_types", filters.financing_types);
  if (filters.down_payment_max !== undefined)
    query = query.lte("down_payment", filters.down_payment_max);
  if (filters.monthly_payment_max !== undefined)
    query = query.lte("monthly_payment", filters.monthly_payment_max);
  if (filters.keywords) {
    query = query.or(
      `address.ilike.%${filters.keywords}%,raw_description.ilike.%${filters.keywords}%`
    );
  }

  const sort = filters.sort ?? "newest";
  if (sort === "newest")
    query = query.order("first_seen_at", { ascending: false });
  else if (sort === "price_asc")
    query = query.order("price", { ascending: true });
  else if (sort === "price_desc")
    query = query.order("price", { ascending: false });

  const limit = filters.limit ?? 50;
  const page = filters.page ?? 0;
  query = query.range(page * limit, page * limit + limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Property[];
}

export async function getProperty(id: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Property;
}

export async function getSavedPropertyIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_properties")
    .select("property_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r) => r.property_id as string));
}
