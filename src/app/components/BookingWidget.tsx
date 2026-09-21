"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Star, Warning, CheckCircle, CalendarCheck } from "@phosphor-icons/react";
import type { Listing } from "@/lib/listings";
import { useTrips } from "@/lib/trips";
import { useAuth } from "@/lib/auth";
import { getDeviceId } from "@/lib/wishlist";
import {
  computeBreakdown,
  nightsBetween,
  rangesOverlap,
  toISODate,
  validateStay,
  type DateRange,
} from "@/lib/pricing";

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** First check-in date (from `start`) whose `nights`-night stay is free. */
export function nextAvailable(start: string, nights: number, booked: DateRange[]): string {
  const d = new Date(start + "T00:00:00");
  for (let i = 0; i < 365; i++) {
    const checkIn = toISODate(d);
    const out = new Date(d);
    out.setDate(out.getDate() + nights);
    const range = { checkIn, checkOut: toISODate(out) };
    if (!booked.some((b) => rangesOverlap(range, b))) return checkIn;
    d.setDate(d.getDate() + 1);
  }
  return start;
}

export default function BookingWidget({
  listing,
  rating,
  reviewCount,
}: {
  listing: Listing;
  /** Live values from the database; fall back to the catalogue values. */
  rating?: number;
  reviewCount?: number;
}) {
  const router = useRouter();
  const { addTrip } = useTrips();
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState(todayPlus(7));
  const [checkOut, setCheckOut] = useState(todayPlus(12));
  const [guests, setGuests] = useState(Math.min(2, listing.guests));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [booked, setBooked] = useState<DateRange[]>([]);
  const [availabilityState, setAvailabilityState] = useState<"loading" | "ready" | "offline">(
    "loading"
  );

  const today = todayPlus(0);

  // Live availability: dates already booked by other guests are refused
  // client-side (instant feedback) and re-checked by the server on submit.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/availability?listing=${encodeURIComponent(listing.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { booked?: DateRange[] }) => {
        if (cancelled) return;
        setBooked(j.booked || []);
        setAvailabilityState("ready");
      })
      .catch(() => {
        if (!cancelled) setAvailabilityState("offline");
      });
    return () => {
      cancelled = true;
    };
  }, [listing.id]);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const breakdown = useMemo(() => computeBreakdown(listing.price, nights), [listing.price, nights]);

  // Same validation rules as the server (`validateStay`), so the UI never
  // promises a stay the API will refuse.
  const validation = useMemo(
    () => validateStay({ checkIn, checkOut, guests }, listing, booked),
    [checkIn, checkOut, guests, listing, booked]
  );
  const dateIssue = validation.ok ? "" : validation.error;
  const conflict = !validation.ok && validation.error.includes("no longer available");
  const suggestion = conflict ? nextAvailable(checkIn, Math.max(nights, 1), booked) : "";

  const upcoming = useMemo(
    () => booked.filter((b) => b.checkOut >= today).slice(0, 3),
    [booked, today]
  );

  const book = async () => {
    if (dateIssue) {
      setError(dateIssue);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          checkIn,
          checkOut,
          guests,
          deviceId: getDeviceId(),
          userId: user?.id,
          // Sent so host-created listings (not in seed data) can still be booked.
          listingData: {
            title: listing.title,
            location: listing.location,
            image: listing.images[0],
            price: listing.price,
            guests: listing.guests,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not complete booking");
        if (Array.isArray(json.booked)) setBooked(json.booked);
      } else {
        addTrip(json.confirmation);
        setDone(true);
        setTimeout(() => router.push("/trips"), 1400);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  };

  const shownRating = rating && rating > 0 ? rating : listing.rating;
  const shownCount = reviewCount ?? listing.reviews;

  return (
    <div
      className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
      data-testid="booking-widget"
    >
      <div className="flex items-baseline justify-between">
        <p>
          <span className="text-2xl font-bold" data-testid="per-night">
            ${listing.price}
          </span>
          <span className="text-[var(--text-dim)]"> night</span>
        </p>
        <span className="flex items-center gap-1 text-sm">
          <Star size={14} weight="fill" color="var(--star)" /> {shownRating.toFixed(2)}
          <span className="text-[var(--text-dim)]">
            · {shownCount} {shownCount === 1 ? "review" : "reviews"}
          </span>
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">
        <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
          <label className="flex flex-col px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Check-in</span>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                if (v && checkOut <= v) {
                  const d = new Date(v + "T00:00:00");
                  d.setDate(d.getDate() + Math.max(nights, 1));
                  setCheckOut(toISODate(d));
                }
              }}
              className="bg-transparent text-sm outline-none"
              data-testid="check-in"
            />
          </label>
          <label className="flex flex-col px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Check-out</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn > today ? checkIn : today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-sm outline-none"
              data-testid="check-out"
            />
          </label>
        </div>
        <label className="flex flex-col border-t border-[var(--border)] px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide">Guests</span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="bg-transparent text-sm outline-none"
            data-testid="guests"
          >
            {Array.from({ length: listing.guests }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p
        className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-dim)]"
        aria-live="polite"
      >
        <CalendarCheck size={14} />
        {availabilityState === "loading" && "Checking availability…"}
        {availabilityState === "offline" && "Availability will be confirmed when you book."}
        {availabilityState === "ready" &&
          (upcoming.length === 0
            ? "All upcoming dates are open."
            : `Booked: ${upcoming.map((b) => `${fmt(b.checkIn)}–${fmt(b.checkOut)}`).join(", ")}`)}
      </p>

      <AnimatePresence>
        {(error || (conflict && suggestion)) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mt-3 flex items-start gap-1.5 text-sm text-[var(--brand)]"
          >
            <Warning size={15} weight="fill" className="mt-0.5 shrink-0" />
            <span>
              {error || dateIssue}
              {conflict && suggestion && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => {
                      setCheckIn(suggestion);
                      const d = new Date(suggestion + "T00:00:00");
                      d.setDate(d.getDate() + Math.max(nights, 1));
                      setCheckOut(toISODate(d));
                      setError("");
                    }}
                    className="font-semibold underline underline-offset-2"
                  >
                    Next free: {fmt(suggestion)}
                  </button>
                </>
              )}
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <button
        onClick={book}
        disabled={busy || done || nights <= 0 || Boolean(dateIssue)}
        className="mt-4 w-full rounded-xl bg-[var(--brand)] py-3 font-semibold text-white transition hover:bg-[var(--brand-dark)] active:scale-[0.99] disabled:opacity-60"
        data-testid="reserve"
      >
        {done ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle size={18} weight="fill" /> Booked! Redirecting…
          </span>
        ) : busy ? (
          "Confirming…"
        ) : (
          "Reserve"
        )}
      </button>
      <p className="mt-2 text-center text-xs text-[var(--text-dim)]">
        You won&apos;t be charged yet
      </p>

      {nights > 0 && (
        <div className="mt-4 flex flex-col gap-2 text-sm" data-testid="price-breakdown">
          <Row
            label={`$${listing.price} x ${nights} ${nights === 1 ? "night" : "nights"}`}
            value={`$${breakdown.nightly}`}
          />
          <Row label="Cleaning fee" value={`$${breakdown.cleaning}`} />
          <Row label="Service fee (12%)" value={`$${breakdown.serviceFee}`} />
          <div className="mt-1 flex justify-between border-t border-[var(--border)] pt-3 font-semibold">
            <span>Total</span>
            <span data-testid="total">${breakdown.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[var(--text-dim)]">
      <span className="underline">{label}</span>
      <span>{value}</span>
    </div>
  );
}
