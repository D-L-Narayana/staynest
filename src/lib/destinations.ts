import type { Listing } from "@/lib/listings";
import { DESTINATIONS, img } from "@/lib/gallery";

export type DestinationCard = {
  city: string;
  country: string;
  stays: number;
  fromPrice: number;
  photo: string; // full image URL
  query: string; // search string that returns exactly these stays
};

/** First token of "Oia, Santorini" → "Santorini"; "Aspen, Colorado" → "Aspen". */
export function cityOf(location: string): string {
  const parts = location.split(",").map((s) => s.trim());
  const known = DESTINATIONS.find((d) =>
    parts.some((p) => p.toLowerCase() === d.city.toLowerCase())
  );
  return known ? known.city : parts[0];
}

/**
 * Destination cards derived from real listings — counts and starting prices
 * are computed, never typed in. Photos come from the curated catalogue when
 * we have one for the city, otherwise from the listing itself.
 */
export function getDestinations(listings: Listing[]): DestinationCard[] {
  const groups = new Map<string, Listing[]>();
  for (const l of listings) {
    const city = cityOf(l.location);
    groups.set(city, [...(groups.get(city) || []), l]);
  }
  return Array.from(groups.entries()).map(([city, group]) => {
    const curated = DESTINATIONS.find((d) => d.city.toLowerCase() === city.toLowerCase());
    return {
      city,
      country: group[0].country,
      stays: group.length,
      fromPrice: Math.min(...group.map((l) => l.price)),
      photo: curated ? img(curated.photo, 800) : group[0].images[0],
      query: city,
    };
  });
}
