"use client";

import dynamic from "next/dynamic";
import type { PropertyWithDistance } from "@/lib/db/properties-query";

const PropertyMap = dynamic(
  () =>
    import("@/components/map/property-map").then((m) => ({
      default: m.PropertyMap,
    })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse" />,
  }
);

export function MapClient({
  properties,
  token,
}: {
  properties: PropertyWithDistance[];
  token: string;
}) {
  return <PropertyMap properties={properties} token={token} />;
}
