import { describe, it, expect } from "vitest";
import { newCode, rowToConfirmation } from "@/lib/bookings";

describe("bookings", () => {
  it("generates unambiguous SN- confirmation codes", () => {
    const codes = new Set(Array.from({ length: 200 }, newCode));
    expect(codes.size).toBe(200);
    for (const c of codes) expect(c).toMatch(/^SN-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });
  it("maps a database row to the client confirmation shape", () => {
    const conf = rowToConfirmation({
      code: "SN-ABCDEF",
      listing_id: "loft-tokyo",
      listing_title: "Loft",
      location: "Tokyo",
      image: "/x.jpg",
      check_in: "2026-10-01",
      check_out: "2026-10-04",
      nights: 3,
      guests: 2,
      total: 1000,
      per_night: 250,
      cleaning: 60,
      service_fee: 190,
      booked_at: "2026-09-21T00:00:00Z",
    });
    expect(conf).toMatchObject({
      code: "SN-ABCDEF",
      listingId: "loft-tokyo",
      nights: 3,
      status: "confirmed",
    });
    expect(conf.breakdown).toEqual({
      nightly: 750,
      cleaning: 60,
      serviceFee: 190,
      total: 1000,
      perNight: 250,
    });
  });
});
