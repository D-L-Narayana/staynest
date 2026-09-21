"use client";

import { useCallback } from "react";
import { createLocalStore, useHydrated } from "@/lib/storage";
import type { Listing } from "@/lib/listings";

// Host-created listings live in the browser (localStorage). They are merged
// into search results and the map client-side, and have working detail pages
// via a client fallback. This mirrors how the wishlist/trips persistence works.
const KEY = "staynest.userListings.v1";

export type ListingDraft = {
  id?: string;
  title: string;
  location: string;
  country: string;
  type: string;
  category: string;
  price: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  superhost: boolean;
  description: string;
  image: string; // primary image url
  amenities: string[];
  lat: number;
  lng: number;
  hostName: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

// Build a complete Listing (matching the seed shape) from a lighter draft.
export function draftToListing(d: ListingDraft): Listing {
  const id =
    d.id || "my-" + (slugify(d.title) || "stay") + "-" + Math.random().toString(36).slice(2, 6);
  const img =
    d.image?.trim() ||
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80";
  return {
    id,
    title: d.title.trim() || "Untitled stay",
    location: d.location.trim() || "Somewhere",
    country: d.country.trim() || "",
    type: d.type.trim() || "Entire place",
    category: d.category || "design",
    price: Math.max(1, Math.round(d.price) || 100),
    rating: 0,
    reviews: 0,
    guests: Math.max(1, Math.round(d.guests) || 2),
    bedrooms: Math.max(0, Math.round(d.bedrooms) || 1),
    beds: Math.max(1, Math.round(d.beds) || 1),
    baths: Math.max(1, Math.round(d.baths) || 1),
    superhost: Boolean(d.superhost),
    images: [img],
    amenities: d.amenities.length ? d.amenities : ["WiFi", "Kitchen"],
    highlights: [
      { title: "Hosted by you", body: "A new stay added through the StayNest host dashboard." },
      { title: "Self check-in", body: "Check yourself in with the smart lock." },
      { title: "Great location", body: `In the heart of ${d.location.trim() || "town"}.` },
    ],
    description:
      d.description.trim() ||
      "A brand-new StayNest listing. Add a description from the host dashboard to tell guests what makes this place special.",
    host: {
      name: d.hostName.trim() || "You",
      since: String(new Date().getFullYear()),
      superhost: Boolean(d.superhost),
      trips: 0,
    },
    lat: Number.isFinite(d.lat) ? d.lat : 0,
    lng: Number.isFinite(d.lng) ? d.lng : 0,
  };
}

export function listingToDraft(l: Listing): ListingDraft {
  return {
    id: l.id,
    title: l.title,
    location: l.location,
    country: l.country,
    type: l.type,
    category: l.category,
    price: l.price,
    guests: l.guests,
    bedrooms: l.bedrooms,
    beds: l.beds,
    baths: l.baths,
    superhost: l.superhost,
    description: l.description,
    image: l.images[0] || "",
    amenities: l.amenities,
    lat: l.lat,
    lng: l.lng,
    hostName: l.host.name,
  };
}

export const userListingsStore = createLocalStore<Listing[]>(KEY, []);

export function readUserListings(): Listing[] {
  return userListingsStore.read();
}

export function getUserListing(id: string): Listing | undefined {
  return readUserListings().find((l) => l.id === id);
}

export function upsertUserListing(draft: ListingDraft): Listing {
  const listing = draftToListing(draft);
  userListingsStore.write((prev) => {
    const idx = prev.findIndex((l) => l.id === listing.id);
    return idx >= 0 ? prev.map((l) => (l.id === listing.id ? listing : l)) : [listing, ...prev];
  });
  return listing;
}

export function removeUserListing(id: string) {
  userListingsStore.write((prev) => prev.filter((l) => l.id !== id));
}

/** Host-created listings for this browser (see `storage.ts`). */
export function useUserListings() {
  const listings = userListingsStore.useValue();
  const ready = useHydrated();
  const upsert = useCallback((draft: ListingDraft) => upsertUserListing(draft), []);
  const remove = useCallback((id: string) => removeUserListing(id), []);
  return { listings, ready, upsert, remove };
}
