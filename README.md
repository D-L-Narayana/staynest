# StayNest — Find your next stay

**Live demo: [staynest-two.vercel.app](https://staynest-two.vercel.app)**

A full-stack Airbnb-style travel marketplace. Browse 16 unique stays around the world by category, open a rich listing page with reviews and a map, save favourites to a wishlist, book with a live price breakdown, message the host, browse experiences and services, and track everything from a host dashboard.

![Tech](https://img.shields.io/badge/Next.js-16-ff385c) ![Tech](https://img.shields.io/badge/Supabase-postgres-3ecf8e) ![Tech](https://img.shields.io/badge/OpenStreetMap-maps-7ebc6f) ![Tech](https://img.shields.io/badge/Motion-animation-purple)

## Features

- **Accounts and guest mode** — real email and password sign up and log in via Supabase Auth, a profile created automatically on signup, a profile menu, and a Continue as guest option to browse and book without an account.
- **Theme options** — light, dark, and system themes plus five accent colors (Coral, Ocean, Forest, Violet, Sunset), applied instantly across the app and remembered, with no flash on load.
- **Built-in assistant** — Nestor, a self-contained guide with over 1,200 question and answer pairs and no external API. As you type, it suggests matching questions; tap one for a preloaded answer covering booking, wishlists, reviews, themes, accounts, experiences, and more.
- **Realtime date validation** — the booking flow reads the live current date, so past check-in dates are blocked both in the date picker and on the server, and check-out must be after check-in.
- **100+ reviews** across all 16 stays, with the category breakdown computed from real review data.

- **16 stays across 8 categories** — beachfront, cabins, design, tropical, countryside, amazing views, iconic cities, and off the grid. Hero photography for the new stays (Santorini cave house, Highland A-frame, Serengeti safari tent, Maldives overwater villa, Joshua Tree, Norway fjord, Tuscan farmhouse, Lisbon flat) is AI-generated.
- **Category rail and search** — Airbnb-style icon tabs plus search by destination, guests, and max price, served by an API route.
- **Rich listing pages** — image gallery, host card with trips hosted, highlights, amenities, an interactive OpenStreetMap of the exact location, and a sticky booking widget.
- **Reviews and ratings** — a category ratings breakdown (cleanliness, accuracy, communication, location, value) computed from real reviews, a review feed, and a working "write a review" form that persists to Supabase.
- **Wishlists** — tap the heart on any stay to save it; the wishlist syncs per-browser through Supabase and has its own page.
- **Booking flow** — date pickers and guest selection with a live price breakdown (nightly, cleaning, service fee, total); the server validates dates and guest limits, returns a confirmation, and records the booking in Supabase.
- **Message the host** — an inquiry form on every listing sends a message that is stored in Supabase.
- **Experiences and Services** — a dedicated page with two tabs: local-led experiences (pasta with a nonna, surf lessons, a Tokyo neon photo walk, a Tuscan wine tasting) and vetted services (private chef, photographer, in-stay spa, training).
- **Host dashboard** — KPIs (revenue, bookings, occupancy, rating), a 6-month revenue trend chart, per-listing performance with occupancy bars, and a live recent-bookings feed sourced from Supabase.
- **My Trips** — confirmed bookings persist and can be cancelled.
- Responsive, animated with Motion, Airbnb coral theme.

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · API Routes · OpenStreetMap embed · Motion · Phosphor Icons

## Getting started

```bash
npm install
# add .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
npm run build && npm start
```

## Architecture

Listings, experiences, and services are seed data also mirrored in Supabase, exposed through `GET /api/listings` (with category and filter support), `GET /api/listing/[id]`, and `GET /api/experiences`. Reviews are read and written via `GET/POST /api/reviews`; wishlists via `GET/POST/DELETE /api/wishlist` keyed by a per-browser device id; host inquiries via `POST /api/inquiries`. Bookings are validated and priced by `POST /api/book` and stored in Supabase, and the host dashboard aggregates them in `GET /api/host`. The app degrades gracefully to seed data when Supabase is not configured.

## Author

**D L Narayana** — [GitHub](https://github.com/D-L-Narayana)
