"use client";

import { useMemo } from "react";
import type { Listing } from "@/lib/listings";
import { createLocalStore, useHydrated } from "@/lib/storage";

// Track recently viewed listings client-side so the home page can show a
// personalised "Recently viewed" strip. We store a snapshot of each listing
// so it works for both seed and host-created listings without extra fetches.
const KEY = "staynest.recentlyViewed.v1";
const MAX = 10;

export const recentlyViewedStore = createLocalStore<Listing[]>(KEY, []);

export function recordView(listing: Listing) {
  if (typeof window === "undefined") return;
  recentlyViewedStore.write((list) =>
    [listing, ...list.filter((x) => x.id !== listing.id)].slice(0, MAX)
  );
}

export function useRecentlyViewed(excludeId?: string) {
  const all = recentlyViewedStore.useValue();
  const ready = useHydrated();
  const items = useMemo(
    () => (excludeId ? all.filter((x) => x.id !== excludeId) : all),
    [all, excludeId]
  );
  return { items, ready };
}
