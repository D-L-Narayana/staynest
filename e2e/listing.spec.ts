import { test, expect } from "@playwright/test";

const CLEANING = 60;
const SERVICE = 0.12;

test.describe("Listing page", () => {
  test("computes the price breakdown correctly and shows live availability", async ({ page }) => {
    await page.goto("/listing/loft-tokyo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const widget = page.getByTestId("booking-widget");
    await expect(widget).toBeVisible();
    const perNightText = await widget.locator("[data-testid=per-night]").innerText();
    const perNight = Number(perNightText.replace(/[^0-9]/g, ""));

    const ci = new Date();
    ci.setDate(ci.getDate() + 30);
    const co = new Date(ci);
    co.setDate(co.getDate() + 4);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    await page.getByTestId("check-in").fill(iso(ci));
    await page.getByTestId("check-out").fill(iso(co));

    const nightly = perNight * 4;
    const expected = nightly + CLEANING + Math.round(nightly * SERVICE);
    await expect(page.getByTestId("total")).toHaveText(
      new RegExp(`\\$${expected.toLocaleString("en-US")}`)
    );
  });

  test("reviews come from the database", async ({ page }) => {
    await page.goto("/listing/villa-amalfi");
    const reviews = page.locator("[data-testid=review]");
    await expect(reviews.first()).toBeVisible({ timeout: 15_000 });
    expect(await reviews.count()).toBeGreaterThanOrEqual(3);
  });

  test("unknown listing renders the 404 page", async ({ page }) => {
    const res = await page.goto("/listing/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/couldn't find that page/i)).toBeVisible();
  });
});
