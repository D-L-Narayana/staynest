"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CurrencyDollar, Calendar, TrendUp, Star, House, Bed } from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import ManageListings from "./ManageListings";

type HostData = {
  summary: {
    totalRevenue: number;
    totalNights: number;
    totalBookings: number;
    avgOccupancy: number;
    avgRating: number;
    activeListings: number;
  };
  trend: { month: string; revenue: number }[];
  listings: {
    id: string;
    title: string;
    location: string;
    image: string;
    price: number;
    rating: number;
    reviews: number;
    occupancy: number;
    bookings: number;
    revenue: number;
  }[];
  recentBookings: {
    code: string;
    listing_title: string;
    location: string;
    check_in: string;
    check_out: string;
    nights: number;
    guests: number;
    total: number;
  }[];
};

const money = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const compactMoney = (n: number) =>
  "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export default function HostPage() {
  const [data, setData] = useState<HostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/host")
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = data
    ? [
        {
          icon: CurrencyDollar,
          label: "Total revenue",
          value: money(data.summary.totalRevenue),
          sub: "all time",
        },
        {
          icon: Calendar,
          label: "Bookings",
          value: data.summary.totalBookings.toLocaleString(),
          sub: `${data.summary.totalNights.toLocaleString()} nights`,
        },
        {
          icon: TrendUp,
          label: "Avg occupancy",
          value: `${data.summary.avgOccupancy}%`,
          sub: "across listings",
        },
        {
          icon: Star,
          label: "Avg rating",
          value: data.summary.avgRating.toFixed(2),
          sub: `${data.summary.activeListings} active listings`,
        },
      ]
    : [];

  const maxTrend = data ? Math.max(...data.trend.map((t) => t.revenue), 1) : 1;

  return (
    <div className="min-h-[100dvh] bg-[var(--muted)]">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-5 py-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Host dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-dim)]">
          Welcome back. Here is how your portfolio is performing.
        </p>

        <ManageListings />

        {loading || !data ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--surface)]" />
            ))}
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k, i) => {
                const Icon = k.icon;
                return (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                      <Icon size={18} weight="fill" />
                    </span>
                    <p className="mt-3 text-2xl font-bold tracking-tight">{k.value}</p>
                    <p className="text-sm text-[var(--text)]">{k.label}</p>
                    <p className="text-xs text-[var(--text-dim)]">{k.sub}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* revenue trend */}
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Revenue, last 6 months</h2>
                <span className="text-sm text-[var(--text-dim)]">
                  Total {money(data.trend.reduce((s, t) => s + t.revenue, 0))}
                </span>
              </div>
              <div className="mt-6 flex items-end gap-3 sm:gap-6">
                {data.trend.map((t, i) => (
                  <div key={t.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-dim)] sm:hidden">
                      {compactMoney(t.revenue)}
                    </span>
                    <span className="hidden text-xs font-medium text-[var(--text-dim)] sm:block">
                      {money(t.revenue)}
                    </span>
                    <div className="flex w-full items-end" style={{ height: 160 }}>
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                          duration: 0.6,
                          delay: i * 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        role="img"
                        aria-label={`${t.month}: ${money(t.revenue)}`}
                        className="w-full origin-bottom rounded-t-lg bg-[var(--brand)]"
                        style={{
                          height: `${Math.max((t.revenue / maxTrend) * 160, 6)}px`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text-dim)]">{t.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              {/* listing performance */}
              <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <House size={18} weight="fill" /> Listing performance
                </h2>
                <div className="mt-4 flex flex-col divide-y divide-[var(--border)]">
                  {data.listings.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 py-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--muted)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.image} alt={l.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.title}</p>
                        <p className="text-xs text-[var(--text-dim)]">
                          {l.location} · {l.bookings} bookings
                        </p>
                      </div>
                      <div className="hidden w-28 sm:block">
                        <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                          <span>Occupancy</span>
                          <span className="font-medium text-[var(--text)]">{l.occupancy}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                          <div
                            className="h-full rounded-full bg-[var(--brand)]"
                            style={{ width: `${l.occupancy}%` }}
                          />
                        </div>
                      </div>
                      <p className="w-20 shrink-0 text-right text-sm font-semibold">
                        {money(l.revenue)}
                        <span className="block text-xs font-normal text-[var(--text-dim)]">
                          / mo
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* recent bookings */}
              <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Bed size={18} weight="fill" /> Recent bookings
                </h2>
                {data.recentBookings.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--text-dim)]">
                    No live bookings yet. Bookings made on StayNest will appear here in real time.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-col divide-y divide-[var(--border)]">
                    {data.recentBookings.map((b) => (
                      <div key={b.code} className="flex items-center justify-between py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{b.listing_title}</p>
                          <p className="text-xs text-[var(--text-dim)]">
                            {b.check_in} to {b.check_out} · {b.guests} guests
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold">{money(b.total)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-[var(--text-dim)]">
          <span>Built by D L Narayana</span>
          <span>Next.js · Supabase · Motion</span>
        </div>
      </footer>
    </div>
  );
}
