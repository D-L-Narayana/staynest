"use client";

import { useRef, useEffect } from "react";
import { ClockCounterClockwise, CaretLeft, CaretRight } from "@phosphor-icons/react";
import ListingCard from "./ListingCard";
import { useRecentlyViewed } from "@/lib/recentlyViewed";
import { useWishlist } from "@/lib/wishlist";

export default function RecentlyViewed() {
  const { items, ready } = useRecentlyViewed();
  const { ids, toggle } = useWishlist();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  if (!ready || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-4 pb-2">
      <div className="flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <ClockCounterClockwise size={22} weight="bold" className="text-[var(--brand)]" />
          Recently viewed
        </h2>
        {items.length > 3 && (
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
        )}
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
