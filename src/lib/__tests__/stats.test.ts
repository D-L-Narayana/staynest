import { describe, it, expect } from "vitest";
import { summarize, seedSiteStats } from "@/lib/stats.server";
import { LISTINGS } from "@/lib/listings";

describe("summarize", () => {
  it("averages every category and rounds to 2 dp", () => {
    const s = summarize([
      {
        listing_id: "x",
        rating: 5,
        cleanliness: 5,
        accuracy: 4,
        communication: 5,
        location_rating: 5,
        value_rating: 4,
      },
      {
        listing_id: "x",
        rating: 4,
        cleanliness: 4,
        accuracy: 4,
        communication: 5,
        location_rating: null,
        value_rating: 3,
      },
    ]);
    expect(s.count).toBe(2);
    expect(s.rating).toBe(4.5);
    expect(s.categories).toEqual({
      cleanliness: 4.5,
      accuracy: 4,
      communication: 5,
      location: 5,
      value: 3.5,
    });
  });
  it("handles an empty listing", () => {
    expect(summarize([])).toMatchObject({ count: 0, rating: 0 });
  });
});

describe("seedSiteStats", () => {
  it("counts listings, categories and countries from the catalogue", () => {
    const s = seedSiteStats(LISTINGS);
    expect(s.listings).toBe(16);
    expect(s.categories).toBe(new Set(LISTINGS.map((l) => l.category)).size);
    expect(s.countries).toBe(new Set(LISTINGS.map((l) => l.country)).size);
    expect(s.fromDb).toBe(false);
  });
});
