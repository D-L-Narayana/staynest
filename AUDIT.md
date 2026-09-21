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
