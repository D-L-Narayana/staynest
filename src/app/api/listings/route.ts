import { NextResponse } from "next/server";
import { LISTINGS } from "@/lib/listings";
import { parseSearchParams, searchListings } from "@/lib/search";

export const dynamic = "force-dynamic";

/**
 * GET /api/listings?q=&category=&guests=&minPrice=&maxPrice=&bedrooms=&superhost=1&amenities=a,b&sort=
 * Filtering/sorting rules live in `src/lib/search.ts` and are shared with the client.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const params = parseSearchParams(searchParams);
  const listings = searchListings(LISTINGS, params);
  return NextResponse.json(
    { listings, total: listings.length, params },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } }
  );
}
