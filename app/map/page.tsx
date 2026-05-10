import { createSearchParamsCache } from "nuqs/server";
import { filterParsers } from "@/lib/filters";
import { queryProperties } from "@/lib/db/properties-query";
import { MapClient } from "./map-client";

const cache = createSearchParamsCache(filterParsers);

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const parsed = cache.parse(await searchParams);
  const properties = await queryProperties(parsed);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <MapClient properties={properties} token={token} />
    </div>
  );
}
