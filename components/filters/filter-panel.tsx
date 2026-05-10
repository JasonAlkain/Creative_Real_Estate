"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryStates } from "nuqs";
import { SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  filterParsers,
  FINANCING_TYPES,
  FINANCING_TYPE_LABELS,
} from "@/lib/filters";
import type { FinancingType } from "@/types";

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PRICE_MAX = 750000;
const SQFT_MAX = 5000;
const DOWN_MAX = 100000;
const MONTHLY_MAX = 5000;

function formatDollars(n: number) {
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
}

function PriceRange({
  min,
  max,
  onChangeMin,
  onChangeMax,
}: {
  min: number | null;
  max: number | null;
  onChangeMin: (v: number | null) => void;
  onChangeMax: (v: number | null) => void;
}) {
  const lo = min ?? 0;
  const hi = max ?? PRICE_MAX;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min == null ? "Any" : `$${lo.toLocaleString()}`}</span>
        <span>{max == null ? "Any" : `$${hi.toLocaleString()}`}</span>
      </div>
      <Slider
        min={0}
        max={PRICE_MAX}
        step={5000}
        value={[lo, hi]}
        onValueChange={(v) => {
          const a = (v as number[])[0];
          const b = (v as number[])[1];
          onChangeMin(a === 0 ? null : a);
          onChangeMax(b === PRICE_MAX ? null : b);
        }}
      />
    </div>
  );
}

export function FilterPanel({ className }: { className?: string }) {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
  });

  // Local state for debounced fields
  const [keywordLocal, setKeywordLocal] = useState(filters.keyword ?? "");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice ?? 0,
    filters.maxPrice ?? PRICE_MAX,
  ]);
  const [sqftRange, setSqftRange] = useState<[number, number]>([
    filters.minSqft ?? 0,
    filters.maxSqft ?? SQFT_MAX,
  ]);
  const [downLocal, setDownLocal] = useState(
    filters.maxDownPayment != null ? String(filters.maxDownPayment) : ""
  );
  const [monthlyLocal, setMonthlyLocal] = useState(
    filters.maxMonthlyPayment != null ? String(filters.maxMonthlyPayment) : ""
  );

  const debouncedKeyword = useDebounced(keywordLocal, 300);
  const debouncedPrice = useDebounced(priceRange, 200);
  const debouncedSqft = useDebounced(sqftRange, 200);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setFilters({
      keyword: debouncedKeyword || null,
      minPrice: debouncedPrice[0] === 0 ? null : debouncedPrice[0],
      maxPrice: debouncedPrice[1] === PRICE_MAX ? null : debouncedPrice[1],
      minSqft: debouncedSqft[0] === 0 ? null : debouncedSqft[0],
      maxSqft: debouncedSqft[1] === SQFT_MAX ? null : debouncedSqft[1],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword, debouncedPrice, debouncedSqft]);

  const toggleFinancing = useCallback(
    (ft: FinancingType) => {
      const current = filters.financingTypes as FinancingType[];
      const next = current.includes(ft)
        ? current.filter((f) => f !== ft)
        : [...current, ft];
      setFilters({ financingTypes: next });
    },
    [filters.financingTypes, setFilters]
  );

  function handleDownBlur() {
    const v = parseFloat(downLocal);
    setFilters({ maxDownPayment: isNaN(v) ? null : v });
  }

  function handleMonthlyBlur() {
    const v = parseFloat(monthlyLocal);
    setFilters({ maxMonthlyPayment: isNaN(v) ? null : v });
  }

  return (
    <aside className={className}>
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={14} className="text-muted-foreground" />
        <span className="text-sm font-semibold">Filters</span>
      </div>

      {/* Keyword */}
      <div className="space-y-1.5 mb-5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Keyword
        </Label>
        <Input
          placeholder="Search address, description…"
          value={keywordLocal}
          onChange={(e) => setKeywordLocal(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <Separator className="mb-5" />

      {/* Financing Types */}
      <div className="space-y-1.5 mb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Financing Type
        </p>
        <div className="space-y-2">
          {FINANCING_TYPES.map((ft) => {
            const checked = (filters.financingTypes as FinancingType[]).includes(ft);
            return (
              <div key={ft} className="flex items-center gap-2">
                <Checkbox
                  id={`ft-${ft}`}
                  checked={checked}
                  onCheckedChange={() => toggleFinancing(ft)}
                />
                <label
                  htmlFor={`ft-${ft}`}
                  className="text-sm cursor-pointer select-none"
                >
                  {FINANCING_TYPE_LABELS[ft]}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Price */}
      <div className="space-y-1.5 mb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Price
        </p>
        <PriceRange
          min={filters.minPrice}
          max={filters.maxPrice}
          onChangeMin={(v) => setPriceRange([v ?? 0, priceRange[1]])}
          onChangeMax={(v) => setPriceRange([priceRange[0], v ?? PRICE_MAX])}
        />
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.minPrice ?? ""}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              const newMin = isNaN(v) ? 0 : v;
              setPriceRange([newMin, priceRange[1]]);
            }}
            className="h-7 text-xs"
          />
          <Input
            placeholder="Max"
            type="number"
            value={filters.maxPrice ?? ""}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              const newMax = isNaN(v) ? PRICE_MAX : v;
              setPriceRange([priceRange[0], newMax]);
            }}
            className="h-7 text-xs"
          />
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Beds / Baths */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Min Beds
          </Label>
          <div className="flex gap-1">
            {[null, 1, 2, 3, 4].map((n) => (
              <button
                key={String(n)}
                onClick={() => setFilters({ minBeds: n })}
                className={`flex-1 rounded border text-xs py-1 transition-colors ${
                  filters.minBeds === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {n == null ? "Any" : `${n}+`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Min Baths
          </Label>
          <div className="flex gap-1">
            {[null, 1, 2, 3].map((n) => (
              <button
                key={String(n)}
                onClick={() => setFilters({ minBaths: n })}
                className={`flex-1 rounded border text-xs py-1 transition-colors ${
                  filters.minBaths === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {n == null ? "Any" : `${n}+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Sqft */}
      <div className="space-y-1.5 mb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Square Feet
        </p>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{sqftRange[0] === 0 ? "Any" : `${sqftRange[0].toLocaleString()} sqft`}</span>
          <span>{sqftRange[1] === SQFT_MAX ? "Any" : `${sqftRange[1].toLocaleString()} sqft`}</span>
        </div>
        <Slider
          min={0}
          max={SQFT_MAX}
          step={100}
          value={sqftRange}
          onValueChange={(v) => setSqftRange(v as [number, number])}
        />
      </div>

      <Separator className="mb-5" />

      {/* Down Payment / Monthly */}
      <div className="space-y-3 mb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Payment Limits
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs">Max Down Payment</Label>
          <Input
            placeholder="e.g. 20000"
            type="number"
            value={downLocal}
            onChange={(e) => setDownLocal(e.target.value)}
            onBlur={handleDownBlur}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Max Monthly Payment</Label>
          <Input
            placeholder="e.g. 1500"
            type="number"
            value={monthlyLocal}
            onChange={(e) => setMonthlyLocal(e.target.value)}
            onBlur={handleMonthlyBlur}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </aside>
  );
}
