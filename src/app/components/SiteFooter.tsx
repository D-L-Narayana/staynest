"use client";

import { useState } from "react";
import Link from "next/link";
import { PaperPlaneRight, House } from "@phosphor-icons/react";
import { toast } from "@/lib/toast";

export default function SiteFooter() {
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      toast("Please enter a valid email", "error");
      return;
    }
    toast("Subscribed — welcome to StayNest!", "success");
    setEmail("");
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)]">
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-1.5 text-lg font-bold">
              <House size={20} weight="fill" className="text-[var(--brand)]" />
              StayNest
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[var(--text-dim)]">
              Unique places to stay around the world. Search, pick your dates, and book in seconds.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-dim)]">
              <li>
                <Link href="/" className="transition hover:text-[var(--text)]">
                  All stays
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="transition hover:text-[var(--text)]">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/trips" className="transition hover:text-[var(--text)]">
                  Trips
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Hosting</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-dim)]">
              <li>
                <Link href="/host" className="transition hover:text-[var(--text)]">
                  Host dashboard
                </Link>
              </li>
              <li>
                <Link href="/host" className="transition hover:text-[var(--text)]">
                  Add a listing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Get travel inspiration</h3>
            <p className="mt-3 text-sm text-[var(--text-dim)]">
              New stays and deals, straight to your inbox.
            </p>
            <form onSubmit={subscribe} className="mt-3 flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white transition hover:bg-[var(--brand-dark)] active:scale-95"
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-dim)]">
          <span>© {new Date().getFullYear()} StayNest · Built by D L Narayana</span>
          <span>Next.js · Supabase · Motion</span>
        </div>
      </div>
    </footer>
  );
}
