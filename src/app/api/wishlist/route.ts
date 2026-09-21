import { NextResponse } from "next/server";
import { supabase, hasSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const device = searchParams.get("device") || "";
  if (!device || !hasSupabase) return NextResponse.json({ ids: [] });
  const { data } = await supabase
    .from("staynest_wishlist")
    .select("listing_id")
    .eq("device_id", device);
  return NextResponse.json({ ids: (data || []).map((r) => r.listing_id) });
}

export async function POST(req: Request) {
  if (!hasSupabase) return NextResponse.json({ ok: true });
  const { device, listingId } = await req.json().catch(() => ({}));
  if (!device || !listingId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await supabase.from("staynest_wishlist").insert({ device_id: device, listing_id: listingId });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!hasSupabase) return NextResponse.json({ ok: true });
  const { device, listingId } = await req.json().catch(() => ({}));
  if (!device || !listingId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await supabase
    .from("staynest_wishlist")
    .delete()
    .eq("device_id", device)
    .eq("listing_id", listingId);
  return NextResponse.json({ ok: true });
}
