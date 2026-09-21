# StayNest — Audit (2026-09-21)

Baseline captured before the upgrade. Every item below was measured, not assumed.

## Environment

- Repo `D-L-Narayana/staynest` @ `1cc81b4` (master, 32 commits). Live: https://staynest-two.vercel.app
- Node 20.20.1 / npm 10.8.2. `npm ci` → 384 packages.

## Build & static analysis

| Check                            | Result                                                                                                                                                                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit`                   | ✅ 0 errors                                                                                                                                                                                                                                        |
| `next build` (16.2.7, Turbopack) | ✅ 24 static pages, 8 dynamic API routes, ~15 s                                                                                                                                                                                                    |
| `eslint .`                       | ❌ 11 errors — all `react-hooks/set-state-in-effect` in `wishlist.ts`, `trips.ts`, `recentlyViewed.ts`, `userListings.ts`, `theme.tsx`, `auth.tsx`, `FiltersModal.tsx`, `Gallery.tsx`, `experiences/page.tsx`, `UserListingDetail.tsx`, `page.tsx` |
| `npm audit`                      | ❌ 8 vulnerabilities (1 critical: `next` 16.2.7 — Middleware/Proxy bypass + DoS; 6 high: sharp/libvips, postcss, browserslist, nanoid, js-yaml, brace-expansion; 1 moderate)                                                                       |
| Tests                            | ❌ none (no `test` script, no test files)                                                                                                                                                                                                          |
| CI                               | ❌ none                                                                                                                                                                                                                                            |
| LICENSE / `.env.example`         | ❌ missing (`.gitignore` ignores `.env*`, so an example file needs an explicit exception)                                                                                                                                                          |
| `metadataBase`                   | ⚠️ unset → OG images resolve to `http://localhost:3000` in the build warning                                                                                                                                                                       |

## Live-site defects

1. **Backend paused.** The Supabase project behind the site (`fhnwwtnjvmvwpxikoswj`) was `INACTIVE`. `/api/reviews?listing=villa-amalfi` took 7.2 s and returned `[]`; `/api/wishlist` 7.1 s; `/api/host` 7.2 s. Listing pages showed "128 reviews" in the header and "No reviews yet" underneath. Restored via the Management API during the audit (data intact: 96 reviews, 11 bookings, 4 experiences, 4 services).
2. **Invented numbers.** Destination strip shows "Santorini · 312 stays", "Bali · 408 stays" etc. — the catalogue has 16 listings. Hero badge claims "1,200+ reviews". Category ratings (Cleanliness/Accuracy/…) are hard-coded 5.0 regardless of reviews.
3. **Wrong author links.** Header GitHub icon and README point to `github.com/Rahul777111`.
4. **Security (RLS).** `staynest_wishlist` has `DELETE USING (true)` (anyone can delete any device's rows); `staynest_bookings` is world-readable; inserts have no `WITH CHECK` constraints on rating range or body length.
5. **Duplicated business logic.** Price breakdown (nightly + $60 cleaning + 12 % service fee) is implemented twice (`BookingWidget.tsx` and `api/book/route.ts`); listing filter logic is implemented twice (`api/listings/route.ts` and `userMatches()` in `page.tsx`). No availability check — the same listing can be double-booked for overlapping dates.
6. **A11y / mobile (360 px).** No horizontal overflow. 5 interactive targets smaller than 24×24 px; smallest text 11 px. 0 console errors on `/` and `/listing/villa-amalfi`.
7. **Performance (prior measurement, throttled sandbox, JOSH-ACTION-PLAN.md 2026-09-21):** mobile Performance 34 (TBT 20.9 s), desktop 92. Fully client-rendered home (`"use client"` on `page.tsx`) + Motion + Leaflet + icon library on the critical path.

## What is genuinely good

- Clean typed data model (`Listing`, 16 detailed seed listings with real cities/coordinates), 8 REST routes, Supabase auth (email/password) + guest mode, light/dark/system theming with 5 accents and a no-flash script, Leaflet map view with 16 markers, wishlist optimistic updates, host dashboard.

---

## Resolution (2026-09-21, same day)

Every baseline finding above was fixed in the `feat/fix/perf/test/docs` commits that followed `1cc81b4`. Verification commands are quoted so the numbers can be reproduced.

| Finding                              | Status                                                                                                                                                                                                                                              | Evidence                                                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| ESLint 11 errors                     | ✅ 0 (`npm run lint`)                                                                                                                                                                                                                               | `set-state-in-effect` cases replaced with `useSyncExternalStore` (`lib/storage.ts`), derived state and event handlers |
| `npm audit` critical (`next` 16.2.7) | ✅ `next` 16.3.5                                                                                                                                                                                                                                    | `npm audit` → 0 critical / 0 high                                                                                     |
| No tests / no CI                     | ✅ 65 unit (14 files) + 28 E2E, GitHub Actions                                                                                                                                                                                                      | `npx vitest run` → `Tests 65 passed`; `npx playwright test` → `28 passed (35 s)`                                      |
| LICENSE / `.env.example`             | ✅ MIT + example with `!.env.example` gitignore exception                                                                                                                                                                                           |                                                                                                                       |
| `metadataBase` unset                 | ✅ `NEXT_PUBLIC_SITE_URL` with production fallback                                                                                                                                                                                                  | build has no metadata warning                                                                                         |
| Backend paused / slow APIs           | ✅ project restored; `/api/reviews` 1.1 s cold, `/api/listings` 0.26 s                                                                                                                                                                              | `curl -w %{time_total}` against production                                                                            |
| Invented numbers                     | ✅ hero and destination counts come from `lib/stats.server.ts` / `lib/destinations.ts` (16 stays · 12 countries · 176 reviews · 4.7 avg)                                                                                                            | rendered HTML: “4.7 average across 176 guest reviews”                                                                 |
| Wrong author links                   | ✅ header, footer, README → `github.com/D-L-Narayana`                                                                                                                                                                                               |                                                                                                                       |
| RLS                                  | ✅ `staynest_bookings` no longer world-readable; `WITH CHECK` on reviews (rating 1–5, body ≤ 2,000) and bookings (dates, guests); indexes on `listing_id`, `device_id`. ⚠️ wishlist `DELETE` remains device-scoped by design — documented in README | Supabase Management API SQL                                                                                           |
| Duplicated business logic            | ✅ `lib/pricing.ts` + `lib/search.ts` shared by UI and API; availability endpoint prevents double-booking                                                                                                                                           | unit tests at 97–98 % line coverage                                                                                   |
| A11y / mobile                        | ✅ 0 overflow at 360/768/1024/1440; min 24 px targets; min 12 px text; Lighthouse Accessibility 100 (mobile + desktop)                                                                                                                              | `/tmp/lh-*.json` summarised in README                                                                                 |
| Performance                          | ✅ mobile 34 → **94**, TBT 20.9 s → 150 ms; desktop 92 → **99**                                                                                                                                                                                     | Lighthouse 12.8.2 on https://staynest-two.vercel.app                                                                  |

### New findings discovered (and fixed) during the upgrade

1. **Root `app/loading.tsx` masked 404s.** With a root loading boundary, Next 16 streamed a `200` shell before `notFound()` ran, so unknown listings returned 200. Removed the root boundary; listing pages now return a real 404 (verified with `curl -I /listing/does-not-exist`).
2. **280 KB FAQ knowledge base and 240 KB `@supabase/supabase-js` were in every route's initial JS.** Both are now dynamically imported on first use.
3. **6.9 MB autoplaying hero video** on every device. It saturated CPU during parallel E2E runs (the root cause of a flaky wishlist test) and dominated mobile load. Re-encoded to 0.92 MB, desktop-only, idle-loaded, disabled under reduced motion.
4. **Wishlist optimistic-update race.** A slow initial `GET /api/wishlist` could resolve after a user's toggle and overwrite it. `WishlistProvider` now keeps an overlay of in-flight toggles (4 regression tests in `lib/__tests__/wishlist.test.tsx`).
5. **"Clear search" used a stale closure** and did not reset all filter state — fixed and covered by E2E.
6. **Host dashboard overflowed at 360 px** (nowrap listing titles inside a grid item without `min-width: 0`; six `$58,854` bar labels). Fixed with `min-w-0` and compact currency labels on small screens.
7. **Brand colour `#ff385c` failed WCAG AA** for white-on-brand buttons and brand-on-white links (3.5:1). Light-mode tokens now use `#d81b4f` (5.0:1); each of the five accents has separate light/dark values, all ≥ 4.5:1.
8. **Vercel build cache served a stale CSS chunk.** A cached Turbopack build kept the old `globals.css` output under an unchanged, `immutable`-cached filename after a token change. Redeploying with `vercel deploy --prod --force` produced a fresh hash. Worth knowing when CSS-only changes appear not to deploy.

### Still open (tracked in README roadmap)

- Wishlist `DELETE` policy is device-scoped, not user-scoped (see README “Honest note”).
- Vercel project is git-linked to the original fork's repository, so pushes to `D-L-Narayana/staynest` do not auto-deploy; production is deployed from the CLI. Re-linking requires the GitHub App to be installed on the `D-L-Narayana` account.
