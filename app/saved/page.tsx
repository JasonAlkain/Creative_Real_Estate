import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property/property-card";
import { InlineStatusSelect } from "@/components/saved/inline-status-select";
import { ShareLinksSection } from "@/components/saved/share-links-section";
import { Separator } from "@/components/ui/separator";
import {
  SAVED_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/saved-status";
import { cn } from "@/lib/utils";
import type { SavedStatus, Property } from "@/types";

type SavedItem = {
  id: string;
  property_id: string;
  status: SavedStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  property: Property;
};

type ShareLinkRow = {
  id: string;
  slug: string;
  created_at: string;
  property: { id: string; address: string; photos: string[] } | null;
};

const SORT_OPTIONS = [
  { value: "recently_saved", label: "Recently Saved" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

function sortItems(items: SavedItem[], sort: SortOption): SavedItem[] {
  return [...items].sort((a, b) => {
    if (sort === "recently_updated")
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    if (sort === "price_asc")
      return (a.property.price ?? 0) - (b.property.price ?? 0);
    if (sort === "price_desc")
      return (b.property.price ?? 0) - (a.property.price ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/saved");

  const params = await searchParams;
  const activeStatus =
    params.status && SAVED_STATUSES.includes(params.status as SavedStatus)
      ? (params.status as SavedStatus)
      : null;
  const activeSort = (params.sort ?? "recently_saved") as SortOption;

  const supabase = await createClient();

  const [{ data: rawSaved }, { data: rawLinks }] = await Promise.all([
    supabase
      .from("saved_properties")
      .select("*, property:properties(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("share_links")
      .select("id, slug, created_at, property:properties(id, address, photos)")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const allSaved = (rawSaved ?? []) as unknown as SavedItem[];
  const shareLinks = (rawLinks ?? []) as unknown as ShareLinkRow[];

  const counts: Record<string, number> = { all: allSaved.length };
  for (const s of SAVED_STATUSES) {
    counts[s] = allSaved.filter((item) => item.status === s).length;
  }

  const filtered = activeStatus
    ? allSaved.filter((item) => item.status === activeStatus)
    : allSaved;
  const sorted = sortItems(filtered, activeSort);

  function tabHref(status: SavedStatus | "all") {
    const sp = new URLSearchParams();
    if (status !== "all") sp.set("status", status);
    if (activeSort !== "recently_saved") sp.set("sort", activeSort);
    return `/saved${sp.toString() ? `?${sp}` : ""}`;
  }

  function sortHref(sort: SortOption) {
    const sp = new URLSearchParams();
    if (activeStatus) sp.set("status", activeStatus);
    if (sort !== "recently_saved") sp.set("sort", sort);
    return `/saved${sp.toString() ? `?${sp}` : ""}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Saved Properties</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {allSaved.length}{" "}
          {allSaved.length === 1 ? "property" : "properties"} saved
        </p>
      </div>

      {allSaved.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No saved properties yet</p>
          <p className="text-sm mt-1">
            Browse listings and tap the heart to save properties.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Browse properties →
          </Link>
        </div>
      ) : (
        <>
          {/* Status tabs */}
          <div className="flex flex-wrap gap-1 mb-4 bg-muted p-1 rounded-lg w-fit max-w-full overflow-x-auto">
            {(["all", ...SAVED_STATUSES] as const).map((s) => {
              const isActive =
                s === "all" ? !activeStatus : activeStatus === s;
              const label = s === "all" ? "All" : STATUS_LABELS[s];
              const count = counts[s] ?? 0;
              return (
                <Link
                  key={s}
                  href={tabHref(s)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                  <span className="ml-1 tabular-nums opacity-70">{count}</span>
                </Link>
              );
            })}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 mb-5 text-xs text-muted-foreground">
            Sort:
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={sortHref(opt.value)}
                className={cn(
                  "px-2 py-0.5 rounded transition-colors",
                  activeSort === opt.value
                    ? "bg-muted text-foreground font-medium"
                    : "hover:text-foreground"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">
                No properties marked as{" "}
                <strong>
                  {activeStatus ? STATUS_LABELS[activeStatus] : ""}
                </strong>{" "}
                yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {sorted.map((item) => (
                <div key={item.id} className="space-y-2">
                  <PropertyCard
                    property={item.property}
                    isSaved={true}
                    savedStatus={item.status}
                    isLoggedIn={true}
                  />
                  <div className="flex items-center gap-2 px-1">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border font-medium",
                        STATUS_COLORS[item.status]
                      )}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                    <InlineStatusSelect
                      propertyId={item.property_id}
                      currentStatus={item.status}
                    />
                  </div>
                  {item.notes && (
                    <details className="px-1">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
                        View Notes
                      </summary>
                      <p className="text-xs mt-1.5 text-muted-foreground whitespace-pre-wrap pl-3 border-l-2 border-muted">
                        {item.notes}
                      </p>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator className="mt-12 mb-6" />

          {/* My Share Links — collapsible */}
          <details>
            <summary className="flex items-center gap-2 cursor-pointer select-none list-none">
              <h2 className="text-base font-semibold">My Share Links</h2>
              <span className="text-xs text-muted-foreground">
                ({shareLinks.length})
              </span>
              <ChevronDown
                size={14}
                className="text-muted-foreground ml-auto"
              />
            </summary>
            <div className="mt-4">
              <ShareLinksSection links={shareLinks} />
            </div>
          </details>
        </>
      )}
    </div>
  );
}
