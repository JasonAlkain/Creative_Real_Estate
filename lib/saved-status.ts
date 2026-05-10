import type { SavedStatus } from "@/types";

export const SAVED_STATUSES: SavedStatus[] = [
  "new",
  "interested",
  "contacted",
  "viewed",
  "offer_made",
  "under_contract",
  "passed",
];

export const STATUS_LABELS: Record<SavedStatus, string> = {
  new: "New",
  interested: "Interested",
  contacted: "Contacted",
  viewed: "Viewed",
  offer_made: "Offer Made",
  under_contract: "Under Contract",
  passed: "Passed",
};

export const STATUS_COLORS: Record<SavedStatus, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  interested: "bg-purple-100 text-purple-800 border-purple-200",
  contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  viewed: "bg-orange-100 text-orange-800 border-orange-200",
  offer_made: "bg-green-100 text-green-800 border-green-200",
  under_contract: "bg-emerald-100 text-emerald-800 border-emerald-200",
  passed: "bg-gray-100 text-gray-600 border-gray-200",
};
