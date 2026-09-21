import { describe, it, expect } from "vitest";
import { tripToICS, type Trip } from "@/lib/trips";

const trip: Trip = {
  code: "SN-TEST01",
  listingId: "villa-amalfi",
  listingTitle: "Cliffside villa; sea views, Amalfi",
  location: "Amalfi, Italy",
  image: "/listings/villa-amalfi.jpg",
  checkIn: "2026-10-02",
  checkOut: "2026-10-05",
  nights: 3,
  guests: 2,
  breakdown: { nightly: 1200, cleaning: 60, serviceFee: 151, total: 1411, perNight: 400 },
  bookedAt: "2026-09-21T00:00:00.000Z",
};

describe("tripToICS", () => {
  const ics = tripToICS(trip);

  it("produces a well-formed VCALENDAR with one VEVENT", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("VERSION:2.0");
  });

  it("uses all-day dates and escapes reserved characters in text", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261002");
    expect(ics).toContain("DTEND;VALUE=DATE:20261005");
    expect(ics).toContain("Cliffside villa\\; sea views\\, Amalfi");
    expect(ics).toContain("UID:SN-TEST01");
  });
});
