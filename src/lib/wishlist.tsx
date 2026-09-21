"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "@/lib/toast";

// A stable per-browser device id so wishlists persist in Supabase across sessions
// without requiring auth. Mirrors how a logged-out Airbnb-style favourites list works.
const DEVICE_KEY = "staynest.device.v1";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = "";
  try {
    id = localStorage.getItem(DEVICE_KEY) || "";
    if (!id) {
      id = "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(DEVICE_KEY, id);
    }
  } catch {
    id = "dev-anon";
  }
  return id;
}

export type WishlistApi = {
  /** Listing ids saved on this device. */
  ids: string[];
  /** True once the first server fetch has settled (success or failure). */
  ready: boolean;
  /** Optimistically add/remove a listing and persist via the API. */
  toggle: (listingId: string) => Promise<void>;
  /** Re-fetch from the server. */
  reload: () => void;
};

const WishlistContext = createContext<WishlistApi | null>(null);

/**
 * One wishlist per page. Every heart on the page (grid, recently viewed, similar
 * stays, wishlist page) shares this state, so a single fetch hydrates them all and
 * toggling one heart updates every other instance instantly.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  // Optimistic changes that the server may not know about yet. `settledAt` is
  // Infinity while the request is in flight, then the completion time. When a GET
  // that *started* before a change settled comes back, the change is re-applied on
  // top of the (stale) server list instead of being wiped out by it.
  const overlay = useRef(new Map<string, { liked: boolean; settledAt: number }>());

  // State is only set inside the promise callbacks (never synchronously in the
  // effect body) and stale responses are ignored.
  useEffect(() => {
    const device = getDeviceId();
    if (!device) return;
    let cancelled = false;
    const startedAt = Date.now();
    fetch(`/api/wishlist?device=${encodeURIComponent(device)}`)
      .then((res) => (res.ok ? res.json() : { ids: [] }))
      .then((json: { ids?: string[] }) => {
        if (cancelled) return;
        const merged = new Set(json.ids || []);
        for (const [id, change] of overlay.current) {
          if (change.settledAt <= startedAt) {
            overlay.current.delete(id); // the server already reflects this change
          } else if (change.liked) {
            merged.add(id);
          } else {
            merged.delete(id);
          }
        }
        setIds([...merged]);
      })
      .catch(() => {
        /* offline — keep the optimistic local state */
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const toggle = useCallback(
    async (listingId: string) => {
      const device = getDeviceId();
      const has = ids.includes(listingId);
      // optimistic update
      overlay.current.set(listingId, { liked: !has, settledAt: Infinity });
      setIds((prev) => (has ? prev.filter((x) => x !== listingId) : [...prev, listingId]));
      toast(has ? "Removed from wishlist" : "Saved to wishlist", "success");
      try {
        const res = await fetch("/api/wishlist", {
          method: has ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device, listingId }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const entry = overlay.current.get(listingId);
        if (entry && entry.liked === !has) entry.settledAt = Date.now();
      } catch {
        // revert on failure
        overlay.current.delete(listingId);
        setIds((prev) => (has ? [...prev, listingId] : prev.filter((x) => x !== listingId)));
        toast("Couldn't update your wishlist. Please try again.", "error");
      }
    },
    [ids]
  );

  const value = useMemo(() => ({ ids, ready, toggle, reload }), [ids, ready, toggle, reload]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistApi {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
