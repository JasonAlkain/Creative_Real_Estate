export type FinancingType =
  | "subject_to"
  | "rent_to_own"
  | "seller_financing"
  | "lease_option"
  | "wrap"
  | "novation"
  | "owner_carry"
  | "land_contract"
  | "other";

export type SavedStatus =
  | "new"
  | "interested"
  | "contacted"
  | "viewed"
  | "offer_made"
  | "under_contract"
  | "passed";

export interface Property {
  id: string;
  source: string;
  source_id: string;
  source_url: string;
  address: string;
  normalized_address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_size_sqft: number | null;
  year_built: number | null;
  price: number | null;
  financing_types: FinancingType[];
  down_payment: number | null;
  monthly_payment: number | null;
  option_fee: number | null;
  lease_term_months: number | null;
  interest_rate: number | null;
  balloon_months: number | null;
  raw_description: string | null;
  parsed_terms: ParsedTerms | null;
  photos: string[];
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  first_seen_at: string;
  last_seen_at: string;
  is_active: boolean;
}

export interface ParsedTerms {
  financing_types: FinancingType[];
  down_payment: number | null;
  monthly_payment: number | null;
  option_fee: number | null;
  lease_term_months: number | null;
  interest_rate: number | null;
  balloon_months: number | null;
  confidence: number;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  status: SavedStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface ShareLink {
  id: string;
  slug: string;
  property_id: string;
  created_by: string;
  created_at: string;
  expires_at: string | null;
}

export interface ScrapeRun {
  id: string;
  source: string;
  started_at: string;
  finished_at: string | null;
  properties_found: number;
  properties_new: number;
  properties_updated: number;
  errors: Record<string, unknown>[];
  status: "running" | "completed" | "failed";
}

export interface Source {
  id: string;
  name: string;
  enabled: boolean;
  base_url: string;
  last_run_at: string | null;
}

export interface PropertyFilters {
  price_min?: number;
  price_max?: number;
  beds_min?: number;
  baths_min?: number;
  sqft_min?: number;
  sqft_max?: number;
  financing_types?: FinancingType[];
  down_payment_max?: number;
  monthly_payment_max?: number;
  keywords?: string;
  distance_miles?: number;
  bounds?: { north: number; south: number; east: number; west: number };
  sort?: "newest" | "price_asc" | "price_desc" | "distance";
  page?: number;
  limit?: number;
}

export interface ScrapeResult {
  source: string;
  properties_found: number;
  properties_new: number;
  properties_updated: number;
  errors: Record<string, unknown>[];
}
