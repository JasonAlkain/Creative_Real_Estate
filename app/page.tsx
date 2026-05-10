import { getProperties } from "@/lib/db/properties";
import { getUser } from "@/lib/supabase/server";
import { getSavedPropertyIds } from "@/lib/db/properties";
import { PropertyCard } from "@/components/property/property-card";

export default async function Home() {
  const [properties, user] = await Promise.all([getProperties(), getUser()]);

  const savedIds = user
    ? await getSavedPropertyIds(user.id)
    : new Set<string>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Creative Financing Properties</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gillette, WY &amp; Campbell County — subject-to, rent-to-own, seller
          financing, lease options, wraps, novations
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No properties yet</p>
          <p className="text-sm mt-1">
            Run the scraper in Admin to populate listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} isSaved={savedIds.has(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
