"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import { useWishlist } from "@/lib/wishlist";
import { useUserListings } from "@/lib/userListings";
import { LISTINGS } from "@/lib/listings";

export default function WishlistPage() {
  const { ids, ready, toggle } = useWishlist();
  const { listings: userListings } = useUserListings();

  const saved = useMemo(
    () => [...userListings, ...LISTINGS].filter((l) => ids.includes(l.id)),
    [ids, userListings]
  );

  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-5 py-8">
        <div className="flex items-center gap-2">
          <Heart size={26} weight="fill" className="text-[var(--brand)]" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your wishlist</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--text-dim)]">
          Saved stays sync to this browser through Supabase.
        </p>

        {!ready ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-[var(--muted)]" />
                <div className="mt-3 h-4 w-2/3 rounded bg-[var(--muted)]" />
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-[var(--border)] py-20 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--muted)]">
              <Heart size={26} className="text-[var(--text-dim)]" />
            </span>
            <p className="mt-4 font-medium">No saved stays yet</p>
            <p className="mt-1 max-w-sm text-sm text-[var(--text-dim)]">
              Tap the heart on any stay to keep it here. Build the trip before you book it.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Explore stays <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} liked onToggle={toggle} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-[var(--text-dim)]">
          <span>Built by D L Narayana</span>
          <span>Next.js · Supabase · Motion</span>
        </div>
      </footer>
    </div>
  );
}
