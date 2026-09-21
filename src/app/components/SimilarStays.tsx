"use client";

import { useRef, useEffect, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import ListingCard from "./ListingCard";
import { useWishlist } from "@/lib/wishlist";
import type { Listing } from "@/lib/listings";

export default function SimilarStays({
  category,
  currentId,
}: {
  category: string;
  currentId: string;
}) {
  const [items, setItems] = useState<Listing[]>([]);
  const { ids, toggle } = useWishlist();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (category && category !== "all") params.set("category", category);
        const res = await fetch(`/api/listings?${params}`);
        const json = await res.json();
        let list: Listing[] = (json.listings || []).filter((l: Listing) => l.id !== currentId);
        // backfill with any listings if the same category is thin
        if (list.length < 4) {
          const all = await fetch(`/api/listings`).then((r) => r.json());
          const extra = (all.listings || []).filter(
            (l: Listing) => l.id !== currentId && !list.some((x) => x.id === l.id)
          );
          list = [...list, ...extra];
        }
        if (!cancelled) setItems(list.slice(0, 8));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, currentId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [items.length]);

  const nudge = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] py-8">
      <div className="flex items-end justify-between gap-3">
        <h3 className="text-lg font-semibold sm:text-xl">More places to stay</h3>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => nudge(-1)}
            aria-label="Scroll left"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--muted)] active:scale-95"
          >
            <CaretLeft size={16} weight="bold" className="text-[var(--text)]" />
          </button>
          <button
            onClick={() => nudge(1)}
            aria-label="Scroll right"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--muted)] active:scale-95"
          >
            <CaretRight size={16} weight="bold" className="text-[var(--text)]" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="no-scrollbar mt-5 flex gap-5 overflow-x-auto pb-2">
        {items.map((l, i) => (
          <div key={l.id} className="w-[260px] shrink-0">
            <ListingCard listing={l} index={i} liked={ids.includes(l.id)} onToggle={toggle} />
          </div>
        ))}
      </div>
    </section>
  );
}
