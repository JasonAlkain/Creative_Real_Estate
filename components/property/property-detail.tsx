import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Bed,
  Bath,
  Square,
  Calendar,
  Expand,
} from "lucide-react";
import { PhotoGallery } from "@/components/property/photo-gallery";
import { FinancingBadges } from "@/components/property/financing-badges";
import { FinancingTerms } from "@/components/property/financing-terms";
import { SaveButton } from "@/components/property/save-button";
import { ShareButton } from "@/components/property/share-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Property, SavedStatus } from "@/types";

export type SavedData = {
  id: string;
  status: SavedStatus;
  notes: string | null;
  created_at: string;
} | null;

function formatPrice(price: number | null) {
  if (!price) return "Price not listed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

interface PropertyDetailProps {
  property: Property;
  savedData: SavedData;
  isLoggedIn: boolean;
  shareMode?: boolean;
  staticMapUrl?: string | null;
}

export function PropertyDetail({
  property,
  savedData,
  isLoggedIn,
  shareMode = false,
  staticMapUrl,
}: PropertyDetailProps) {
  const propertyPath = `/property/${property.id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-12">
      {shareMode ? (
        <div className="flex items-center justify-between mb-6 rounded-xl bg-muted/50 border px-4 py-2.5">
          <p className="text-sm text-muted-foreground">
            Shared with you via Creative RE
          </p>
          <Link
            href="/"
            className="text-sm text-primary hover:underline underline-offset-2"
          >
            Browse all properties →
          </Link>
        </div>
      ) : (
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to listings
        </Link>
      )}

      <PhotoGallery photos={property.photos} address={property.address} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-xl font-bold leading-snug">{property.address}</h1>
            <p className="text-sm text-muted-foreground">
              {property.city}, {property.state} {property.zip}
            </p>
            <p className="text-3xl font-bold mt-2">
              {formatPrice(property.price)}
            </p>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {property.beds !== null && (
                <span className="flex items-center gap-1.5">
                  <Bed size={14} />
                  {property.beds} beds
                </span>
              )}
              {property.baths !== null && (
                <span className="flex items-center gap-1.5">
                  <Bath size={14} />
                  {property.baths} baths
                </span>
              )}
              {property.sqft !== null && (
                <span className="flex items-center gap-1.5">
                  <Square size={14} />
                  {property.sqft.toLocaleString()} sqft
                </span>
              )}
              {property.year_built !== null && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Built {property.year_built}
                </span>
              )}
              {property.lot_size_sqft !== null && (
                <span className="flex items-center gap-1.5">
                  <Expand size={14} />
                  {(property.lot_size_sqft / 43560).toFixed(2)} acres
                </span>
              )}
            </div>

            {property.financing_types.length > 0 && (
              <div className="mt-4">
                <FinancingBadges types={property.financing_types} />
              </div>
            )}
          </div>

          <Separator />

          <FinancingTerms property={property} />

          {property.raw_description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {property.raw_description}
                </p>
              </CardContent>
            </Card>
          )}

          {(property.contact_name ||
            property.contact_phone ||
            property.contact_email) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {property.contact_name && (
                  <p className="font-medium">{property.contact_name}</p>
                )}
                {property.contact_phone && (
                  <p>
                    <a
                      href={`tel:${property.contact_phone.replace(/\D/g, "")}`}
                      className="hover:underline"
                    >
                      {property.contact_phone}
                    </a>
                  </p>
                )}
                {property.contact_email && (
                  <p>
                    <a
                      href={`mailto:${property.contact_email}`}
                      className="hover:underline"
                    >
                      {property.contact_email}
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-3 lg:sticky lg:top-20 self-start">
          {property.source_url === "#" ? (
            <Button variant="outline" className="w-full" disabled>
              <ExternalLink size={14} className="mr-1.5" />
              View on Original Site
              <span className="ml-auto text-xs text-muted-foreground">
                (seed data)
              </span>
            </Button>
          ) : (
            <a
              href={property.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              <ExternalLink size={14} className="mr-1.5" />
              View on Original Site
            </a>
          )}

          <SaveButton
            propertyId={property.id}
            initialSaved={!!savedData}
            initialStatus={savedData?.status ?? null}
            initialNotes={savedData?.notes}
            savedAt={savedData?.created_at}
            variant="detail"
            propertyPath={shareMode ? `/s/${property.id}` : propertyPath}
          />

          <ShareButton
            propertyId={property.id}
            propertyPath={shareMode ? `/s/${property.id}` : propertyPath}
          />

          {staticMapUrl && (
            <div className="rounded-xl overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={staticMapUrl}
                alt={`Map showing ${property.address}`}
                className="w-full block"
                loading="lazy"
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-1">
            <p>Source: {property.source}</p>
            <p>
              Listed:{" "}
              {new Date(property.first_seen_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
