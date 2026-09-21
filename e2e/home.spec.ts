import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("renders the catalogue and searches by destination", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/StayNest/);
    const cards = page.getByRole("link", { name: /night/i });
    await expect(cards.first()).toBeVisible();
    const before = await cards.count();
    expect(before).toBeGreaterThanOrEqual(8);

    await page
      .getByPlaceholder(/Where to\?/i)
      .first()
      .fill("Tokyo");
    await page.keyboard.press("Enter");
    await expect(page.getByText(/Tokyo/).first()).toBeVisible();
    await expect.poll(async () => cards.count()).toBeLessThan(before);
  });

  test("shows an empty state for impossible searches and clears it", async ({ page }) => {
    await page.goto("/");
    await page
      .getByPlaceholder(/Where to\?/i)
      .first()
      .fill("Atlantis");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByTestId("empty-state")).toBeHidden();
  });

  test("hero stats come from real data", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/average across \d+ guest reviews/)).toBeVisible();
    await expect(page.getByText(/\d+ stays · \d+ categories · \d+ countries/)).toBeVisible();
  });

  test("switches to the map view", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Map view" }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible();
  });
});
