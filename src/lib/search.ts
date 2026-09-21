import type { Listing } from "@/lib/listings";

/**
 * Pure listing search/sort helpers shared by the `/api/listings` route and the
 * client (host-created listings live in the browser and are merged in with the
 * same rules). Keeping this framework-free makes it unit-testable.
 */
export type SortKey = "recommended" | "recent" | "price_low" | "price_high" | "rating";

export type SearchParams = {
  q?: string;
  category?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  superhost?: boolean;
  amenities?: string[];
  sort?: SortKey | string;
};

export const SORT_KEYS: SortKey[] = ["recommended", "recent", "price_low", "price_high", "rating"];

export function matchesListing(l: Listing, p: SearchParams): boolean {
  const q = (p.q || "").toLowerCase().trim();
  if (
    q &&
    !(
      l.location.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q)
    )
  )
    return false;
  const category = (p.category || "all").toLowerCase();
  if (category !== "all" && l.category !== category) return false;
  if ((p.guests || 0) > 0 && l.guests < (p.guests as number)) return false;
  if ((p.minPrice || 0) > 0 && l.price < (p.minPrice as number)) return false;
  if ((p.maxPrice || 0) > 0 && l.price > (p.maxPrice as number)) return false;
  if ((p.bedrooms || 0) > 0 && l.bedrooms < (p.bedrooms as number)) return false;
  if (p.superhost && !l.superhost) return false;
  const wanted = (p.amenities || []).map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (wanted.length) {
    const have = l.amenities.map((a) => a.toLowerCase());
    if (!wanted.every((a) => have.some((h) => h.includes(a)))) return false;
  }
  return true;
}

export function sortListings<T extends Listing>(list: T[], sort: string | undefined): T[] {
  const out = list.slice();
  switch ((sort || "recommended").toLowerCase()) {
    case "recent":
      return out.reverse(); // source order is chronological; newest are last
    case "price_low":
      return out.sort((a, b) => a.price - b.price);
    case "price_high":
      return out.sort((a, b) => b.price - a.price);
    case "rating":
      return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    default:
      return out;
  }
}

export function searchListings<T extends Listing>(list: T[], p: SearchParams): T[] {
  return sortListings(
    list.filter((l) => matchesListing(l, p)),
    p.sort
  );
}

/** Parse `URLSearchParams` (from the API route) into typed `SearchParams`. */
export function parseSearchParams(sp: URLSearchParams): SearchParams {
  const num = (k: string) => {
    const n = Number(sp.get(k) || 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  return {
    q: sp.get("q") || "",
    category: sp.get("category") || "all",
    guests: num("guests"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    bedrooms: num("bedrooms"),
    superhost: sp.get("superhost") === "1",
    amenities: (sp.get("amenities") || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    sort: (sp.get("sort") || "recommended").toLowerCase(),
  };
}
