import { NextResponse } from "next/server";
import { supabase, hasSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listing") || "";
  if (!hasSupabase) return NextResponse.json({ reviews: [] });
  let query = supabase
    .from("staynest_reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (listingId) query = query.eq("listing_id", listingId);
  const { data } = await query;
  return NextResponse.json({ reviews: data || [] });
}

export async function POST(req: Request) {
  if (!hasSupabase) return NextResponse.json({ error: "Reviews unavailable" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const { listingId, author, rating, body: text } = body;
  if (!listingId || !author || !rating || !text)
    return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 });

  const r = Math.max(1, Math.min(5, Number(rating)));
  const avatar = (author as string).trim().charAt(0).toUpperCase() || "G";
  const row = {
    listing_id: listingId,
    author,
    avatar,
    rating: r,
    cleanliness: r,
    accuracy: r,
    communication: r,
    location_rating: r,
    value_rating: r,
    body: text,
  };
  const { data, error } = await supabase.from("staynest_reviews").insert(row).select().single();
  if (error) return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  return NextResponse.json({ review: data });
}
