import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/listings/route";
import { LISTINGS } from "@/lib/listings";

describe("GET /api/listings", () => {
  it("returns the full catalogue by default", async () => {
    const res = await GET(new Request("http://localhost/api/listings"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(LISTINGS.length);
    expect(json.listings[0]).toHaveProperty("id");
  });
  it("applies query, price and sort", async () => {
    const res = await GET(
      new Request("http://localhost/api/listings?q=united%20states&maxPrice=900&sort=price_high")
    );
    const json = await res.json();
    expect(json.listings.length).toBeGreaterThan(0);
    for (const l of json.listings) {
      expect(l.country).toBe("United States");
      expect(l.price).toBeLessThanOrEqual(900);
    }
    for (let i = 1; i < json.listings.length; i++)
      expect(json.listings[i].price).toBeLessThanOrEqual(json.listings[i - 1].price);
  });
  it("returns an empty list, not an error, for no matches", async () => {
    const res = await GET(new Request("http://localhost/api/listings?q=atlantis"));
    expect((await res.json()).listings).toEqual([]);
  });
});
