/** A row of the `staynest_bookings` table. */
export type BookingRow = {
  code: string;
  listing_id: string;
  listing_title: string;
  location: string;
  image: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total: number;
  per_night: number;
  cleaning: number;
  service_fee: number;
  booked_at: string;
  status?: string;
};

export function newCode() {
  // Crypto-quality, unambiguous (no 0/O, 1/I) confirmation code: SN-XXXXXX
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return "SN-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function rowToConfirmation(r: BookingRow) {
  return {
    code: r.code,
    listingId: r.listing_id,
    listingTitle: r.listing_title,
    location: r.location,
    image: r.image,
    checkIn: r.check_in,
    checkOut: r.check_out,
    nights: r.nights,
    guests: r.guests,
    breakdown: {
      nightly: r.per_night * r.nights,
      cleaning: r.cleaning,
      serviceFee: r.service_fee,
      total: r.total,
      perNight: r.per_night,
    },
    bookedAt: r.booked_at,
    status: r.status || "confirmed",
  };
}
