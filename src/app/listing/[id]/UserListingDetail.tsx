"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Users,
  Bed,
  Bathtub,
  House,
  ArrowLeft,
  Sparkle,
  Key,
  Medal,
} from "@phosphor-icons/react";
import { useUserListings } from "@/lib/userListings";
import { recordView } from "@/lib/recentlyViewed";
import Navbar from "@/app/components/Navbar";
import BookingWidget from "@/app/components/BookingWidget";
import ReviewsSection, { InquiryForm } from "./ReviewsSection";
import LocationMap from "./LocationMap";
import ShareButton from "@/app/components/ShareButton";
import SimilarStays from "@/app/components/SimilarStays";
import Gallery from "@/app/components/Gallery";
import SiteFooter from "@/app/components/SiteFooter";

const HL_ICONS = [Sparkle, Key, Medal];

export default function UserListingDetail({ id }: { id: string }) {
  const { listings, ready } = useUserListings();
  const listing = listings.find((l) => l.id === id) || null;

  useEffect(() => {
    if (listing) recordView(listing);
  }, [listing]);

  if (!ready) {
    return (
      <div className="min-h-[100dvh]">
        <Navbar />
        <main className="mx-auto max-w-[1120px] px-5 py-10">
          <div className="h-8 w-1/2 animate-pulse rounded bg-[var(--muted)]" />
          <div className="mt-6 h-[360px] animate-pulse rounded-2xl bg-[var(--muted)]" />
        </main>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[100dvh]">
        <Navbar />
        <main className="mx-auto flex max-w-[1120px] flex-col items-center px-5 py-24 text-center">
          <House size={48} className="text-[var(--text-dim)]" />
          <h1 className="mt-4 text-2xl font-bold">Stay not found</h1>
          <p className="mt-2 max-w-md text-sm text-[var(--text-dim)]">
            This listing could not be found. Host-created stays are saved in the browser they were
            added on.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <ArrowLeft size={16} /> Back to all stays
          </Link>
        </main>
      </div>
    );
  }

  const facts = [
    { icon: Users, label: `${listing.guests} guests` },
    { icon: House, label: `${listing.bedrooms} bedrooms` },
    { icon: Bed, label: `${listing.beds} beds` },
    { icon: Bathtub, label: `${listing.baths} baths` },
  ];

  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main className="mx-auto max-w-[1120px] px-5 py-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] transition hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} /> All stays
        </Link>

        <span className="inline-block rounded-full bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand)]">
          Your listing
        </span>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{listing.title}</h1>
          <ShareButton title={listing.title} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-dim)]">
          <span className="flex items-center gap-1 text-[var(--text)]">
            <Star size={14} weight="fill" color="var(--star)" />{" "}
            {listing.rating > 0 ? listing.rating : "New"}
          </span>
          <span>· {listing.reviews} reviews</span>
          {listing.superhost && <span>· Superhost</span>}
          <span>
            · {listing.location}
            {listing.country ? `, ${listing.country}` : ""}
          </span>
        </div>

        {/* gallery */}
        <Gallery images={listing.images} title={listing.title} />

        {/* body */}
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {listing.type} hosted by {listing.host.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-dim)]">
                  Host since {listing.host.since}
                </p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-lg font-bold text-white">
                {listing.host.name[0]?.toUpperCase()}
              </div>
            </div>

            <div className="flex flex-wrap gap-5 border-b border-[var(--border)] py-6">
              {facts.map((f) => {
                const Icon = f.icon;
                return (
                  <span key={f.label} className="flex items-center gap-2 text-sm">
                    <Icon size={20} className="text-[var(--text-dim)]" /> {f.label}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-col gap-5 border-b border-[var(--border)] py-6">
              {listing.highlights.map((h, i) => {
                const Icon = HL_ICONS[i % HL_ICONS.length];
                return (
                  <div key={h.title} className="flex items-start gap-4">
                    <Icon size={24} className="mt-0.5 shrink-0 text-[var(--text)]" />
                    <div>
                      <p className="font-medium">{h.title}</p>
                      <p className="text-sm text-[var(--text-dim)]">{h.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="border-b border-[var(--border)] py-6 leading-relaxed text-[var(--text)]">
              {listing.description}
            </p>

            <div className="border-b border-[var(--border)] py-6">
              <h3 className="mb-4 text-lg font-semibold">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <ReviewsSection
              listingId={listing.id}
              rating={listing.rating}
              reviews={listing.reviews}
            />

            {!(listing.lat === 0 && listing.lng === 0) && (
              <LocationMap
                lat={listing.lat}
                lng={listing.lng}
                location={listing.location}
                country={listing.country}
              />
            )}

            <InquiryForm listingId={listing.id} hostName={listing.host.name} />
          </div>

          <div>
            <BookingWidget listing={listing} />
          </div>
        </div>

        <SimilarStays category={listing.category} currentId={listing.id} />
      </main>

      <SiteFooter />
    </div>
  );
}
