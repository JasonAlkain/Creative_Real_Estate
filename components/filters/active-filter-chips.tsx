"use client";

import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { filterParsers, FINANCING_TYPE_LABELS } from "@/lib/filters";
import type { FinancingType } from "@/types";

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <X size={10} />
      </button>
    </span>
  );
}

export function ActiveFilterChips() {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
  });

  const chips: { label: string; clear: () => void }[] = [];

  if (filters.minPrice != null)
    chips.push({
      label: `Min $${filters.minPrice.toLocaleString()}`,
      clear: () => setFilters({ minPrice: null }),
    });
  if (filters.maxPrice != null)
    chips.push({
      label: `Max $${filters.maxPrice.toLocaleString()}`,
      clear: () => setFilters({ maxPrice: null }),
    });
  if (filters.minBeds != null)
    chips.push({
      label: `${filters.minBeds}+ beds`,
      clear: () => setFilters({ minBeds: null }),
    });
  if (filters.minBaths != null)
    chips.push({
      label: `${filters.minBaths}+ baths`,
      clear: () => setFilters({ minBaths: null }),
    });
  if (filters.minSqft != null)
    chips.push({
      label: `Min ${filters.minSqft.toLocaleString()} sqft`,
      clear: () => setFilters({ minSqft: null }),
    });
  if (filters.maxSqft != null)
    chips.push({
      label: `Max ${filters.maxSqft.toLocaleString()} sqft`,
      clear: () => setFilters({ maxSqft: null }),
    });
  if (filters.maxDownPayment != null)
    chips.push({
      label: `Down ≤ $${filters.maxDownPayment.toLocaleString()}`,
      clear: () => setFilters({ maxDownPayment: null }),
    });
  if (filters.maxMonthlyPayment != null)
    chips.push({
      label: `Mo. ≤ $${filters.maxMonthlyPayment.toLocaleString()}`,
      clear: () => setFilters({ maxMonthlyPayment: null }),
    });
  if (filters.keyword)
    chips.push({
      label: `"${filters.keyword}"`,
      clear: () => setFilters({ keyword: null }),
    });
  if (filters.radiusMi != null)
    chips.push({
      label: `Within ${filters.radiusMi} mi`,
      clear: () => setFilters({ radiusMi: null, lat: null, lng: null }),
    });

  for (const ft of filters.financingTypes as FinancingType[]) {
    chips.push({
      label: FINANCING_TYPE_LABELS[ft],
      clear: () =>
        setFilters({
          financingTypes: filters.financingTypes.filter(
            (f) => f !== ft
          ) as FinancingType[],
        }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {chips.map((chip) => (
        <Chip key={chip.label} label={chip.label} onRemove={chip.clear} />
      ))}
      <button
        onClick={() =>
          setFilters({
            minPrice: null,
            maxPrice: null,
            minBeds: null,
            minBaths: null,
            minSqft: null,
            maxSqft: null,
            financingTypes: [],
            maxDownPayment: null,
            maxMonthlyPayment: null,
            keyword: null,
            radiusMi: null,
            lat: null,
            lng: null,
          })
        }
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
