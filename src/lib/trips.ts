"use client";

import { useCallback, useEffect, useState } from "react";
import { getDeviceId } from "@/lib/wishlist";
import { createLocalStore, useHydrated } from "@/lib/storage";

export type Trip = {
  code: string;
  listingId: string;
  listingTitle: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  breakdown: {
    nightly: number;
    cleaning: number;
    serviceFee: number;
    total: number;
    perNight: number;
  };
  bookedAt: string;
};

const KEY = "staynest.trips.v1";
export const tripsStore = createLocalStore<Trip[]>(KEY, []);

/** Trips booked from this browser. Also mirrored in Supabase by `/api/book`. */
export function useTrips() {
  const trips = tripsStore.useValue();
  const ready = useHydrated();

  const persist = useCallback((next: Trip[]) => tripsStore.write(next), []);
  const addTrip = useCallback(
    (t: Trip) => tripsStore.write((prev) => [t, ...prev.filter((x) => x.code !== t.code)]),
    []
  );
  const removeTrip = useCallback(
    (code: string) => tripsStore.write((prev) => prev.filter((t) => t.code !== code)),
    []
  );

  return { trips, ready, addTrip, removeTrip, persist };
}

/**
 * Pull bookings made from this browser out of Supabase (`GET /api/book?device=`)
 * and merge them into the local store, so trips survive a cleared cache and
 * appear on every tab. Local-only trips (offline bookings) are kept.
 */
export function useSyncTripsFromServer() {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  useEffect(() => {
    const device = getDeviceId();
    if (!device) return;
    let cancelled = false;
    fetch(`/api/book?device=${encodeURIComponent(device)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { trips?: Trip[] }) => {
        if (cancelled) return;
        const remote = j.trips || [];
        if (remote.length) {
          tripsStore.write((prev) => {
            const byCode = new Map(prev.map((t) => [t.code, t]));
            for (const t of remote) byCode.set(t.code, { ...byCode.get(t.code), ...t });
            return Array.from(byCode.values()).sort((a, b) => b.bookedAt.localeCompare(a.bookedAt));
          });
        }
        setStatus("done");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}

/** RFC 5545 calendar file for a trip (used by the "Add to calendar" button). */
export function tripToICS(t: Trip): string {
  const d = (iso: string) => iso.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => "\\" + m);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StayNest//Trips//EN",
    "BEGIN:VEVENT",
    `UID:${t.code}@staynest`,
    `DTSTAMP:${new Date(t.bookedAt)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${d(t.checkIn)}`,
    `DTEND;VALUE=DATE:${d(t.checkOut)}`,
    `SUMMARY:${esc(`Stay at ${t.listingTitle}`)}`,
    `LOCATION:${esc(t.location)}`,
    `DESCRIPTION:${esc(`Confirmation ${t.code} · ${t.guests} guests · $${t.breakdown.total} total`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
