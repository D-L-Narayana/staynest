import { describe, it, expect } from "vitest";
import { LISTINGS } from "@/lib/listings";
import { cityOf, getDestinations } from "@/lib/destinations";
import { searchListings } from "@/lib/search";

describe("destinations", () => {
  it("normalises city names", () => {
    expect(cityOf("Oia, Santorini")).toBe("Santorini");
    expect(cityOf("Aspen, Colorado")).toBe("Aspen");
    expect(cityOf("Tokyo")).toBe("Tokyo");
  });
  it("derives counts and starting prices from the catalogue", () => {
    const cards = getDestinations(LISTINGS);
    const total = cards.reduce((s, c) => s + c.stays, 0);
    expect(total).toBe(LISTINGS.length);
    for (const c of cards) {
      expect(c.stays).toBeGreaterThan(0);
      expect(c.fromPrice).toBeGreaterThan(0);
      expect(c.photo).toMatch(/^(https:\/\/|\/listings\/)/);
    }
  });
  it("every destination card leads to at least one search result", () => {
    for (const c of getDestinations(LISTINGS)) {
      expect(searchListings(LISTINGS, { q: c.query }).length).toBeGreaterThanOrEqual(1);
    }
  });
});
