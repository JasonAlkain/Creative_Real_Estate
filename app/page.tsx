import { createSearchParamsCache } from "nuqs/server";
import { SlidersHorizontal } from "lucide-react";
import { filterParsers } from "@/lib/filters";
import { queryProperties } from "@/lib/db/properties-query";
import { getUser } from "@/lib/supabase/server";
import { getSavedPropertyIds } from "@/lib/db/properties";
import { PropertyCard } from "@/components/property/property-card";
import { FilterPanel } from "@/components/filters/filter-panel";
import { ActiveFilterChips } from "@/components/filters/active-filter-chips";
import { SortSelect } from "@/components/filters/sort-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const cache = createSearchParamsCache(filterParsers);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const parsed = cache.parse(await searchParams);

  const [properties, user] = await Promise.all([
    queryProperties(parsed),
    getUser(),
  ]);

  const savedIds = user
    ? await getSavedPropertyIds(user.id)
    : new Set<string>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold">Creative Financing Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gillette, WY &amp; Campbell County — subject-to, rent-to-own,
            seller financing, lease options &amp; more
          </p>
        </div>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden shrink-0"
              />
            }
          >
            <SlidersHorizontal size={14} className="mr-1.5" />
            Filters
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[88vh] overflow-y-auto pb-10"
          >
            <SheetHeader className="pb-0">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterPanel className="px-4 pt-3" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Active chips + sort */}
      <div className="flex flex-wrap items-center gap-2 mb-5 min-h-[28px]">
        <ActiveFilterChips />
        <div className="ml-auto shrink-0">
          <SortSelect />
        </div>
      </div>

      {/* Desktop layout: sidebar + results */}
      <div className="flex gap-6">
        {/* Filter sidebar — desktop only */}
        <FilterPanel className="hidden lg:block w-72 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border bg-card p-4" />

        {/* Results */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-3">
            {properties.length}{" "}
            {properties.length === 1 ? "property" : "properties"}
          </p>

          {properties.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">
                No properties match your filters
              </p>
              <p className="text-sm mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  isSaved={savedIds.has(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
