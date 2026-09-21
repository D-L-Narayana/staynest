import { NextResponse } from "next/server";
import { getBookedRanges } from "@/lib/bookings.server";
import { toISODate } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?listing=<id>
 * Returns date ranges (half-open, ISO dates) that are already booked, from today
 * onward. The booking widget uses this to block dates before the user submits;
 * `/api/book` re-checks on the server so the client can never double-book.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listing = searchParams.get("listing");
  if (!listing) return NextResponse.json({ error: "listing is required" }, { status: 400 });
  const today = toISODate(new Date());
  const booked = await getBookedRanges(listing, today);
  return NextResponse.json(
    { listingId: listing, booked, asOf: today },
    { headers: { "Cache-Control": "no-store" } }
  );
}
