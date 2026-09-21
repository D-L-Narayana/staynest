import { supabase, hasSupabase } from "@/lib/supabase";
import { LISTINGS, type Listing } from "@/lib/listings";

/**
 * Review statistics computed from the database (never hard-coded).
 * Used by server components with ISR so pages stay static-fast but truthful.
 */
export type ListingStats = {
  count: number;
  rating: number; // 0 when no reviews
  categories: Record<"cleanliness" | "accuracy" | "communication" | "location" | "value", number>;
};

export type SiteStats = {
  listings: number;
  categories: number;
  countries: number;
  reviews: number;
  avgRating: number;
  fromDb: boolean;
};

type ReviewRow = {
  listing_id: string;
  rating: number;
  cleanliness: number | null;
  accuracy: number | null;
  communication: number | null;
  location_rating: number | null;
  value_rating: number | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, n) => s + n, 0) / xs.length : 0);

export function summarize(rows: ReviewRow[]): ListingStats {
  const num = (k: keyof ReviewRow) =>
    rows.map((r) => Number(r[k])).filter((n) => Number.isFinite(n) && n > 0);
  return {
    count: rows.length,
    rating: round2(mean(num("rating"))),
    categories: {
      cleanliness: round2(mean(num("cleanliness"))),
      accuracy: round2(mean(num("accuracy"))),
      communication: round2(mean(num("communication"))),
      location: round2(mean(num("location_rating"))),
      value: round2(mean(num("value_rating"))),
    },
  };
}

export async function getListingStats(listingId: string): Promise<ListingStats | null> {
  if (!hasSupabase) return null;
  const { data, error } = await supabase
    .from("staynest_reviews")
    .select(
      "listing_id, rating, cleanliness, accuracy, communication, location_rating, value_rating"
    )
    .eq("listing_id", listingId)
    .limit(1000);
  if (error || !data) return null;
  return summarize(data as ReviewRow[]);
}

export function seedSiteStats(listings: Listing[] = LISTINGS): SiteStats {
  return {
    listings: listings.length,
    categories: new Set(listings.map((l) => l.category)).size,
    countries: new Set(listings.map((l) => l.country)).size,
    reviews: 0,
    avgRating: 0,
    fromDb: false,
  };
}

export async function getSiteStats(): Promise<SiteStats> {
  const base = seedSiteStats();
  if (!hasSupabase) return base;
  const { data, error } = await supabase.from("staynest_reviews").select("rating").limit(5000);
  if (error || !data) return base;
  const ratings = data.map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
  return { ...base, reviews: ratings.length, avgRating: round2(mean(ratings)), fromDb: true };
}
