/**
 * Booking price rules — the single source of truth used by the booking widget
 * (instant client-side preview) and `/api/book` (authoritative total).
 */
export const CLEANING_FEE = 60;
export const SERVICE_FEE_RATE = 0.12;
export const MAX_NIGHTS = 90;

export type Breakdown = {
  perNight: number;
  nights: number;
  nightly: number;
  cleaning: number;
  serviceFee: number;
  total: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse an ISO `YYYY-MM-DD` string as local midnight; `null` when invalid. */
export function parseISODate(s: string | undefined | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole nights between two ISO dates (0 when invalid or not after). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  if (!a || !b) return 0;
  const n = Math.round((b.getTime() - a.getTime()) / DAY_MS);
  return n > 0 ? n : 0;
}

export function computeBreakdown(perNight: number, nights: number): Breakdown {
  const n = Math.max(0, Math.floor(nights));
  const nightly = perNight * n;
  const cleaning = n > 0 ? CLEANING_FEE : 0;
  const serviceFee = Math.round(nightly * SERVICE_FEE_RATE);
  return {
    perNight,
    nights: n,
    nightly,
    cleaning,
    serviceFee,
    total: nightly + cleaning + serviceFee,
  };
}

export type DateRange = { checkIn: string; checkOut: string };

/** Half-open interval overlap: [a.in, a.out) ∩ [b.in, b.out) ≠ ∅. */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.checkIn < b.checkOut && b.checkIn < a.checkOut;
}

export type StayValidation = { ok: true; nights: number } | { ok: false; error: string };

/**
 * Validate a requested stay against the listing capacity, today's date and any
 * already-booked ranges. `today` is injectable for deterministic tests.
 */
export function validateStay(
  input: { checkIn?: string; checkOut?: string; guests?: number },
  listing: { guests: number },
  booked: DateRange[] = [],
  today: Date = new Date()
): StayValidation {
  const { checkIn, checkOut } = input;
  if (!checkIn || !checkOut) return { ok: false, error: "Select check-in and check-out dates" };
  const start = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  if (!start || !end) return { ok: false, error: "Invalid dates" };
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (start < todayMidnight) return { ok: false, error: "Check-in cannot be in the past" };
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) return { ok: false, error: "Check-out must be after check-in" };
  if (nights > MAX_NIGHTS) return { ok: false, error: `Stays are limited to ${MAX_NIGHTS} nights` };
  const guests = input.guests || 1;
  if (guests > listing.guests)
    return { ok: false, error: `This place allows up to ${listing.guests} guests` };
  if (booked.some((b) => rangesOverlap({ checkIn, checkOut }, b)))
    return { ok: false, error: "Those dates are no longer available" };
  return { ok: true, nights };
}

export function formatMoney(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
