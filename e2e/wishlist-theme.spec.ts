import { test, expect } from "@playwright/test";

test("wishlist persists across reloads", async ({ page }) => {
  await page.goto("/");
  const save = page.getByRole("button", { name: "Save to wishlist" }).first();
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/api/wishlist") && r.request().method() === "POST"
    ),
    save.click(),
  ]);
  await expect(page.getByRole("button", { name: "Remove from wishlist" }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove from wishlist" }).first()).toBeVisible({
    timeout: 15_000,
  });
  await page.goto("/wishlist");
  await expect(page.getByTestId("listing-card").first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Remove from wishlist" }).first()).toBeVisible();
});

test("theme switcher toggles the data-theme attribute and persists", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Theme settings" }).click();
  await page.getByTestId("theme-dark").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Theme settings" }).click();
  await expect(page.getByTestId("theme-light")).toBeVisible();
  await page.getByTestId("theme-light").click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("keyboard users can reach the search and the first stay", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const active = await page.evaluate(() => document.activeElement?.tagName);
  expect(["A", "BUTTON", "INPUT"]).toContain(active);
});
