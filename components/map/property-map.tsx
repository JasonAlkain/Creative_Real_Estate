"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryStates } from "nuqs";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import { filterParsers } from "@/lib/filters";
import type { PropertyWithDistance } from "@/lib/db/properties-query";

const GILLETTE = { lng: -105.502, lat: 44.291 };

type Props = {
  properties: PropertyWithDistance[];
  token: string;
};

function makeGeoJSON(
  properties: PropertyWithDistance[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: properties
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.lng!, p.lat!] },
        properties: {
          id: p.id,
          address: p.address,
          price: p.price,
          beds: p.beds,
          baths: p.baths,
          sqft: p.sqft,
          financing_types: p.financing_types.join(", "),
        },
      })),
  };
}

function formatPrice(price: number | null) {
  if (!price) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyMap({ properties, token }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const router = useRouter();
  const [, setFilters] = useQueryStates(filterParsers, { shallow: false });

  const handleSearchArea = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    const radiusMi =
      center.distanceTo(
        new mapboxgl.LngLat(bounds.getEast(), center.lat)
      ) / 1609.34;
    setFilters({ lat: center.lat, lng: center.lng, radiusMi: Math.ceil(radiusMi) });
  }, [setFilters]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [GILLETTE.lng, GILLETTE.lat],
      zoom: 11,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("properties", {
        type: "geojson",
        data: makeGeoJSON(properties),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "properties",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#3b82f6",
            5,
            "#1d4ed8",
            10,
            "#1e3a8a",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            5,
            22,
            10,
            28,
          ],
          "circle-opacity": 0.9,
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "properties",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      // Individual pins
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "properties",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#285A98",
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Expand clusters on click
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("properties") as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const coords = (
            features[0].geometry as GeoJSON.Point
          ).coordinates as [number, number];
          map.easeTo({ center: coords, zoom });
        });
      });

      // Popup on individual pin click
      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [
          number,
          number,
        ];
        const props = feature.properties!;

        popupRef.current?.remove();
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="min-width:180px;font-family:sans-serif">
            <p style="font-weight:600;font-size:13px;margin:0 0 2px">${props.address}</p>
            ${props.price ? `<p style="font-size:15px;font-weight:700;margin:0 0 4px">${formatPrice(props.price)}</p>` : ""}
            <p style="font-size:11px;color:#666;margin:0 0 6px">${[props.beds && `${props.beds} bd`, props.baths && `${props.baths} ba`, props.sqft && `${Number(props.sqft).toLocaleString()} sqft`].filter(Boolean).join(" · ")}</p>
            <a href="/property/${props.id}" style="font-size:12px;color:#285A98;text-decoration:underline">View listing →</a>
          </div>
        `;
        popupRef.current = new mapboxgl.Popup({ offset: 12 })
          .setLngLat(coords)
          .setDOMContent(el)
          .addTo(map);
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update GeoJSON when properties change without reinitializing map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("properties") as mapboxgl.GeoJSONSource | undefined;
    source?.setData(makeGeoJSON(properties));
  }, [properties]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleSearchArea}
          className="bg-white rounded-full px-4 py-1.5 text-sm font-medium shadow-md border border-border hover:bg-muted transition-colors"
        >
          Search this area
        </button>
      </div>
    </div>
  );
}
