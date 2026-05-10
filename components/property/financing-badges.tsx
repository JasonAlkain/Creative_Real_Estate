import { cn } from "@/lib/utils";
import type { FinancingType } from "@/types";

const LABEL: Record<FinancingType, string> = {
  subject_to: "Subject-To",
  rent_to_own: "Rent-To-Own",
  seller_financing: "Seller Finance",
  lease_option: "Lease Option",
  wrap: "Wrap",
  novation: "Novation",
  owner_carry: "Owner Carry",
  land_contract: "Land Contract",
  other: "Other",
};

const COLOR: Record<FinancingType, string> = {
  subject_to: "bg-red-100 text-red-800 border-red-200",
  rent_to_own: "bg-blue-100 text-blue-800 border-blue-200",
  seller_financing: "bg-green-100 text-green-800 border-green-200",
  lease_option: "bg-purple-100 text-purple-800 border-purple-200",
  wrap: "bg-orange-100 text-orange-800 border-orange-200",
  novation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  owner_carry: "bg-teal-100 text-teal-800 border-teal-200",
  land_contract: "bg-indigo-100 text-indigo-800 border-indigo-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

export function FinancingBadges({ types }: { types: FinancingType[] }) {
  if (!types.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {types.map((type) => (
        <span
          key={type}
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            COLOR[type]
          )}
        >
          {LABEL[type]}
        </span>
      ))}
    </div>
  );
}
