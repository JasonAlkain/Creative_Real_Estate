import {
  parseAsFloat,
  parseAsInteger,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { FinancingType } from "@/types";

export const FINANCING_TYPES = [
  "subject_to",
  "rent_to_own",
  "seller_financing",
  "lease_option",
  "wrap",
  "novation",
  "owner_carry",
  "land_contract",
  "other",
] as const satisfies readonly FinancingType[];

export const FINANCING_TYPE_LABELS: Record<FinancingType, string> = {
  subject_to: "Subject-To",
  rent_to_own: "Rent-to-Own",
  seller_financing: "Seller Financing",
  lease_option: "Lease Option",
  wrap: "Wrap",
  novation: "Novation",
  owner_carry: "Owner Carry",
  land_contract: "Land Contract",
  other: "Other",
};

export const SORT_OPTIONS = [
  "newest",
  "price_asc",
  "price_desc",
  "distance",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low → High",
  price_desc: "Price: High → Low",
  distance: "Distance",
};

export const filterParsers = {
  minPrice: parseAsFloat,
  maxPrice: parseAsFloat,
  minBeds: parseAsInteger,
  minBaths: parseAsFloat,
  minSqft: parseAsInteger,
  maxSqft: parseAsInteger,
  financingTypes: parseAsArrayOf(parseAsStringLiteral(FINANCING_TYPES)).withDefault([]),
  maxDownPayment: parseAsFloat,
  maxMonthlyPayment: parseAsFloat,
  keyword: parseAsString,
  sort: parseAsStringLiteral(SORT_OPTIONS).withDefault("newest"),
  lat: parseAsFloat,
  lng: parseAsFloat,
  radiusMi: parseAsFloat,
} as const;

export type FilterState = {
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
  minBaths: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  financingTypes: FinancingType[];
  maxDownPayment: number | null;
  maxMonthlyPayment: number | null;
  keyword: string | null;
  sort: SortOption;
  lat: number | null;
  lng: number | null;
  radiusMi: number | null;
};
