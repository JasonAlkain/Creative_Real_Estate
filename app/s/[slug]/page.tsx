import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server";
import { PropertyDetail } from "@/components/property/property-detail";
import type { SavedData } from "@/components/property/property-detail";
import type { Property, SavedStatus } from "@/types";

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("share_links")
    .select("*, property:properties(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!link) notFound();
  if (link.expires_at && new Date(link.expires_at) < new Date()) notFound();

  const property = link.property as Property;
  if (!property) notFound();

  const user = await getUser();
  let savedData: SavedData = null;
  if (user) {
    const { data } = await supabase
      .from("saved_properties")
      .select("id, status, notes, created_at")
      .eq("user_id", user.id)
      .eq("property_id", property.id)
      .maybeSingle();
    if (data) {
      savedData = {
        id: data.id as string,
        status: data.status as SavedStatus,
        notes: data.notes as string | null,
        created_at: data.created_at as string,
      };
    }
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const staticMapUrl =
    property.lat && property.lng && mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-home+285A98(${property.lng},${property.lat})/${property.lng},${property.lat},13,0/600x300?access_token=${mapboxToken}`
      : null;

  return (
    <PropertyDetail
      property={property}
      savedData={savedData}
      isLoggedIn={!!user}
      shareMode={true}
      staticMapUrl={staticMapUrl}
    />
  );
}
