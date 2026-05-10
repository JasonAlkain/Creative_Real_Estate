"use client";

import { useQueryStates } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterParsers, SORT_LABELS, type SortOption } from "@/lib/filters";

export function SortSelect() {
  const [{ sort }, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
  });

  return (
    <Select
      value={sort}
      onValueChange={(v) => setFilters({ sort: v as SortOption })}
    >
      <SelectTrigger size="sm" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
          ([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );
}
