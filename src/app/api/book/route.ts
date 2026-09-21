import { NextResponse } from "next/server";
import { getListing } from "@/lib/listings";
import { supabase, hasSupabase } from "@/lib/supabase";
import { computeBreakdown, validateStay } from "@/lib/pricing";
import { getBookedRanges } from "@/lib/bookings.server";

export const dynamic = "force-dynamic";
import { newCode, rowToConfirmation, type BookingRow } from "@/lib/bookings";

type BookBody = {
  listingId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  /** Anonymous per-browser id so `/trips` can be rebuilt from the server. */
  deviceId?: string;
  /** Supabase auth user id when signed in (unverified: demo-grade linkage). */
  userId?: string;
  // Optional listing data for host-created (client-side) listings that
  // do not exist in the seed data set.
  listingData?: {
    title?: string;
    location?: string;
    image?: string;
    price?: number;
    guests?: number;
  };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const device = searchParams.get("device");
  if (!device) return NextResponse.json({ error: "device is required" }, { status: 400 });
  if (!hasSupabase) return NextResponse.json({ trips: [] });
  const { data, error } = await supabase
    .from("staynest_bookings")
    .select("*")
    .eq("device_id", device)
    .order("booked_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "Could not load trips" }, { status: 502 });
  return NextResponse.json({ trips: (data as BookingRow[]).map(rowToConfirmation) });
}

export async function POST(req: Request) {
  let body: BookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { listingId, checkIn, checkOut, guests, listingData, deviceId, userId } = body;
  const seed = listingId ? getListing(listingId) : undefined;
  // Fall back to client-provided data for host-created listings.
  const listing =
    seed ||
    (listingId && listingData && listingData.price
      ? {
          id: listingId,
          title: listingData.title || "Your stay",
          location: listingData.location || "",
          images: [listingData.image || ""],
          price: Math.max(1, Math.round(Number(listingData.price))),
          guests: Math.max(1, Math.round(Number(listingData.guests) || 1)),
        }
      : undefined);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Availability is checked against live bookings so overlapping stays are refused.
  const booked = await getBookedRanges(listing.id, checkIn);
  const check = validateStay({ checkIn, checkOut, guests }, listing, booked);
  if (!check.ok) {
    const conflict = check.error.includes("no longer available");
    return NextResponse.json({ error: check.error, booked }, { status: conflict ? 409 : 400 });
  }
  const { nights } = check;
  const breakdown = computeBreakdown(listing.price, nights);

  const code = newCode();
  const bookedAt = new Date().toISOString();

  // Persist to Supabase when configured (cross-device record of the booking)
  if (hasSupabase) {
    const { error } = await supabase.from("staynest_bookings").insert({
      code,
      listing_id: listing.id,
      listing_title: listing.title,
      location: listing.location,
      image: listing.images[0],
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guests: guests || 1,
      total: breakdown.total,
      per_night: listing.price,
      cleaning: breakdown.cleaning,
      service_fee: breakdown.serviceFee,
      booked_at: bookedAt,
      device_id: deviceId || null,
      user_id: userId || null,
      status: "confirmed",
    });
    if (error) {
      return NextResponse.json(
        { error: "We couldn't save your booking. Please try again." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({
    confirmation: {
      code,
      listingId: listing.id,
      listingTitle: listing.title,
      location: listing.location,
      image: listing.images[0],
      checkIn,
      checkOut,
      nights,
      guests: guests || 1,
      breakdown,
      bookedAt,
      status: "confirmed",
    },
  });
}
