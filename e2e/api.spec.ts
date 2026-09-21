import { test, expect } from "@playwright/test";

test.describe("REST API contract", () => {
  test("GET /api/listings filters and sorts", async ({ request }) => {
    const res = await request.get("/api/listings?q=italy&sort=price_low");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.total).toBeGreaterThan(0);
    expect(json.listings.every((l: { country: string }) => l.country === "Italy")).toBe(true);
  });

  test("GET /api/availability returns booked ranges", async ({ request }) => {
    const res = await request.get("/api/availability?listing=loft-tokyo");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toMatchObject({ listingId: "loft-tokyo" });
    expect(Array.isArray(json.booked)).toBe(true);
  });

  test("POST /api/book validates input", async ({ request }) => {
    const bad = await request.post("/api/book", {
      data: { listingId: "loft-tokyo", checkIn: "2020-01-01", checkOut: "2020-01-02", guests: 1 },
    });
    expect(bad.status()).toBe(400);
    const missing = await request.post("/api/book", { data: { listingId: "nope" } });
    expect([400, 404]).toContain(missing.status());
  });

  test("GET /api/reviews returns real reviews", async ({ request }) => {
    const res = await request.get("/api/reviews?listing=villa-amalfi");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const list = json.reviews ?? json;
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list[0]).toHaveProperty("rating");
  });
});
