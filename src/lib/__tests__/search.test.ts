import { describe, it, expect } from "vitest";
import { LISTINGS } from "@/lib/listings";
import { matchesListing, parseSearchParams, searchListings, sortListings } from "@/lib/search";

describe("matchesListing", () => {
  const tokyo = LISTINGS.find((l) => l.id === "loft-tokyo")!;
  it("matches on location, country, title and type, case-insensitively", () => {
    expect(matchesListing(tokyo, { q: "tokyo" })).toBe(true);
    expect(matchesListing(tokyo, { q: "JAPAN" })).toBe(true);
    expect(matchesListing(tokyo, { q: tokyo.title.slice(0, 6) })).toBe(true);
    expect(matchesListing(tokyo, { q: "Antarctica" })).toBe(false);
  });
  it("filters by category, capacity, price and bedrooms", () => {
    expect(matchesListing(tokyo, { category: tokyo.category })).toBe(true);
    expect(matchesListing(tokyo, { category: "not-a-category" })).toBe(false);
    expect(matchesListing(tokyo, { guests: tokyo.guests })).toBe(true);
    expect(matchesListing(tokyo, { guests: tokyo.guests + 1 })).toBe(false);
    expect(matchesListing(tokyo, { minPrice: tokyo.price + 1 })).toBe(false);
    expect(matchesListing(tokyo, { maxPrice: tokyo.price - 1 })).toBe(false);
    expect(matchesListing(tokyo, { bedrooms: tokyo.bedrooms + 5 })).toBe(false);
  });
  it("requires every requested amenity (substring, case-insensitive)", () => {
    const first = tokyo.amenities[0];
    expect(matchesListing(tokyo, { amenities: [first.toUpperCase()] })).toBe(true);
    expect(matchesListing(tokyo, { amenities: [first, "Private helipad"] })).toBe(false);
  });
});

describe("sortListings", () => {
  it("sorts by price both ways without mutating the input", () => {
    const input = LISTINGS.slice();
    const low = sortListings(input, "price_low");
    expect(low.map((l) => l.price)).toEqual(
      low
        .map((l) => l.price)
        .slice()
        .sort((a, b) => a - b)
    );
    const high = sortListings(input, "price_high");
    expect(high[0].price).toBe(Math.max(...input.map((l) => l.price)));
    expect(input).toEqual(LISTINGS);
  });
  it("keeps recommended order and reverses for recent", () => {
    expect(sortListings(LISTINGS, "recommended")[0].id).toBe(LISTINGS[0].id);
    expect(sortListings(LISTINGS, "recent")[0].id).toBe(LISTINGS[LISTINGS.length - 1].id);
  });
  it("orders by rating with review count as tiebreaker", () => {
    const a = { ...LISTINGS[0], rating: 4.9, reviews: 10 };
    const b = { ...LISTINGS[1], rating: 4.9, reviews: 50 };
    const c = { ...LISTINGS[2], rating: 5, reviews: 1 };
    expect(sortListings([a, b, c], "rating").map((l) => l.id)).toEqual([c.id, b.id, a.id]);
  });
});

describe("searchListings + parseSearchParams", () => {
  it("returns the whole catalogue with no filters", () => {
    expect(searchListings(LISTINGS, {})).toHaveLength(LISTINGS.length);
  });
  it("parses query strings the API receives", () => {
    const p = parseSearchParams(
      new URLSearchParams(
        "q=Bali&guests=2&maxPrice=500&superhost=1&amenities=Pool,%20WiFi&sort=PRICE_LOW"
      )
    );
    expect(p).toMatchObject({
      q: "Bali",
      guests: 2,
      maxPrice: 500,
      superhost: true,
      amenities: ["Pool", "WiFi"],
      sort: "price_low",
    });
    expect(parseSearchParams(new URLSearchParams("guests=-3&minPrice=abc")).guests).toBe(0);
  });
  it("combines filters (Italy under $700 sorted by price)", () => {
    const res = searchListings(LISTINGS, { q: "italy", maxPrice: 700, sort: "price_low" });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((l) => l.country === "Italy" && l.price <= 700)).toBe(true);
    for (let i = 1; i < res.length; i++)
      expect(res[i].price).toBeGreaterThanOrEqual(res[i - 1].price);
  });
});
