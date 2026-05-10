import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/types";
import type { FilterState } from "@/lib/filters";

const GILLETTE_LAT = 44.291;
const GILLETTE_LNG = -105.502;

function haversineDistanceMi(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type PropertyWithDistance = Property & { distanceMi: number | null };

export async function queryProperties(
  filters: Partial<FilterState>
): Promise<PropertyWithDistance[]> {
  const supabase = await createClient();

  let query = supabase.from("properties").select("*").eq("is_active", true);

  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.minBeds != null) query = query.gte("beds", filters.minBeds);
  if (filters.minBaths != null) query = query.gte("baths", filters.minBaths);
  if (filters.minSqft != null) query = query.gte("sqft", filters.minSqft);
  if (filters.maxSqft != null) query = query.lte("sqft", filters.maxSqft);
  if (filters.financingTypes?.length)
    query = query.overlaps("financing_types", filters.financingTypes);
  if (filters.maxDownPayment != null)
    query = query.lte("down_payment", filters.maxDownPayment);
  if (filters.maxMonthlyPayment != null)
    query = query.lte("monthly_payment", filters.maxMonthlyPayment);
  if (filters.keyword) {
    const kw = filters.keyword.replace(/'/g, "''");
    query = query.or(
      `address.ilike.%${kw}%,raw_description.ilike.%${kw}%`
    );
  }

  // Fetch all and sort/filter distance client-side (dataset is small)
  const sort = filters.sort ?? "newest";
  if (sort !== "distance") {
    if (sort === "newest")
      query = query.order("first_seen_at", { ascending: false });
    else if (sort === "price_asc")
      query = query.order("price", { ascending: true });
    else if (sort === "price_desc")
      query = query.order("price", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const centerLat = filters.lat ?? GILLETTE_LAT;
  const centerLng = filters.lng ?? GILLETTE_LNG;

  let results = (data ?? []).map((p) => {
    const distanceMi =
      p.lat != null && p.lng != null
        ? haversineDistanceMi(centerLat, centerLng, p.lat, p.lng)
        : null;
    return { ...(p as Property), distanceMi };
  });

  // Distance radius filter (JS-side)
  if (filters.radiusMi != null) {
    results = results.filter(
      (p) => p.distanceMi == null || p.distanceMi <= filters.radiusMi!
    );
  }

  if (sort === "distance") {
    results.sort((a, b) => {
      if (a.distanceMi == null) return 1;
      if (b.distanceMi == null) return -1;
      return a.distanceMi - b.distanceMi;
    });
  }

  return results;
}
