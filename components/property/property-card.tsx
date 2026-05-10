import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Square } from "lucide-react";
import { FinancingBadges } from "@/components/property/financing-badges";
import { SaveButton } from "@/components/property/save-button";
import type { Property, SavedStatus } from "@/types";

function formatPrice(price: number | null) {
  if (price === null) return "Price not listed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  savedStatus?: SavedStatus | null;
  isLoggedIn?: boolean;
}

export function PropertyCard({
  property,
  isSaved = false,
  savedStatus = null,
  isLoggedIn = false,
}: PropertyCardProps) {
  const photo = property.photos[0];
  const propertyPath = `/property/${property.id}`;

  return (
    <div className="relative group">
      {/* Save button — outside Link so clicks don't navigate */}
      <div className="absolute top-2 right-2 z-10">
        <SaveButton
          propertyId={property.id}
          initialSaved={isSaved}
          initialStatus={savedStatus}
          variant="card"
          propertyPath={propertyPath}
        />
      </div>

      <Link href={propertyPath} className="block">
        <div className="rounded-xl border bg-card ring-1 ring-foreground/10 overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col">
          {/* Photo */}
          <div className="relative aspect-video bg-muted shrink-0">
            {photo ? (
              <Image
                src={photo}
                alt={property.address}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                No photo
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2 flex flex-col flex-1">
            <div>
              <p className="font-semibold text-sm line-clamp-1 leading-snug">
                {property.address}
              </p>
              <p className="text-xs text-muted-foreground">
                {property.city}, {property.state}
              </p>
            </div>

            <p className="text-base font-bold">{formatPrice(property.price)}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {property.beds !== null && (
                <span className="flex items-center gap-1">
                  <Bed size={11} />
                  {property.beds} bd
                </span>
              )}
              {property.baths !== null && (
                <span className="flex items-center gap-1">
                  <Bath size={11} />
                  {property.baths} ba
                </span>
              )}
              {property.sqft !== null && (
                <span className="flex items-center gap-1">
                  <Square size={11} />
                  {property.sqft.toLocaleString()} sqft
                </span>
              )}
            </div>

            <div className="mt-auto pt-1">
              <FinancingBadges types={property.financing_types} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
