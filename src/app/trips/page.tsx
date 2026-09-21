"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  SuitcaseRolling,
  Trash,
  CalendarBlank,
  Users,
  MapPin,
  CheckCircle,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import { useTrips, useSyncTripsFromServer, tripToICS, type Trip } from "@/lib/trips";

export default function TripsPage() {
  const { trips, removeTrip, ready } = useTrips();
  const sync = useSyncTripsFromServer();

  const downloadICS = (t: Trip) => {
    const blob = new Blob([tripToICS(t)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staynest-${t.code}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main className="mx-auto max-w-[900px] px-5 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <SuitcaseRolling size={26} weight="fill" className="text-[var(--brand)]" /> My Trips
        </h1>
        <p className="mt-1 text-sm text-[var(--text-dim)]" aria-live="polite">
          {trips.length} {trips.length === 1 ? "booking" : "bookings"}
          {sync === "syncing" && " · syncing…"}
          {sync === "error" && " · showing bookings saved on this device"}
        </p>

        {!ready ? (
          <div className="mt-6 flex flex-col gap-4" aria-busy="true" aria-label="Loading trips">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-[var(--muted)]" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] py-20 text-center">
            <p className="text-[var(--text-dim)]">No trips booked yet.</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Start exploring
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {trips.map((t) => (
                <motion.div
                  layout
                  key={t.code}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-[var(--border)] p-4 sm:flex-row"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.listingTitle}
                    className="h-40 w-full rounded-xl object-cover sm:h-auto sm:w-48"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--brand)]">
                          <CheckCircle size={13} weight="fill" /> Confirmed · {t.code}
                        </span>
                        <Link
                          href={`/listing/${t.listingId}`}
                          className="mt-1 block font-semibold hover:underline"
                        >
                          {t.listingTitle}
                        </Link>
                        <span className="flex items-center gap-1 text-sm text-[var(--text-dim)]">
                          <MapPin size={13} /> {t.location}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => downloadICS(t)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-[var(--text-dim)] transition hover:bg-[var(--muted)] hover:text-[var(--text)]"
                          aria-label={`Add ${t.listingTitle} to calendar`}
                          title="Add to calendar (.ics)"
                        >
                          <CalendarBlank size={16} />
                        </button>
                        <button
                          onClick={() => removeTrip(t.code)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-[var(--text-dim)] transition hover:bg-[var(--muted)] hover:text-[var(--brand)]"
                          aria-label={`Remove ${t.listingTitle} from my trips`}
                          title="Remove from my trips"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--text-dim)]">
                      <span className="flex items-center gap-1.5">
                        <CalendarBlank size={14} />
                        {fmt(t.checkIn)} - {fmt(t.checkOut)} · {t.nights} nights
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={14} /> {t.guests} guests
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-sm text-[var(--text-dim)]">
                        ${t.breakdown.perNight} / night
                      </span>
                      <span className="font-semibold">Total ${t.breakdown.total}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString([], { month: "short", day: "numeric" });
}
