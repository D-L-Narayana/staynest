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
} from "@phosphor-icons/react/dist/ssr";
import { getListing, LISTINGS } from "@/lib/listings";
import Navbar from "@/app/components/Navbar";
import BookingWidget from "@/app/components/BookingWidget";
import ReviewsSection, { InquiryForm } from "./ReviewsSection";
import LocationMap from "./LocationMap";
import type { Metadata } from "next";
import UserListingDetail from "./UserListingDetail";
import { notFound } from "next/navigation";
import Gallery from "@/app/components/Gallery";
import SiteFooter from "@/app/components/SiteFooter";
import RecordView from "@/app/components/RecordView";
import { getListingStats } from "@/lib/stats.server";
import ShareButton from "@/app/components/ShareButton";
import SimilarStays from "@/app/components/SimilarStays";

// Pages are static but revalidated so review counts/ratings reflect the database.
export const revalidate = 300;

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const l = getListing(id);
  if (!l)
    return {
      title: id.startsWith("my-") ? "Your stay" : "Stay not found",
      robots: { index: false },
    };
  const description = l.description.slice(0, 155);
  const title = `${l.title} · ${l.location}`;
  return {
    title,
    description,
    openGraph: { title, description, images: l.images.slice(0, 1) },
    twitter: { card: "summary_large_image", title, description, images: l.images.slice(0, 1) },
  };
}

const HL_ICONS = [Sparkle, Key, Medal];

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListing(id);
  // Host-created listings live in the browser; render a client fallback that
  // hydrates them from localStorage.
  if (!listing) {
    // Host-created stays live in the visitor's browser (prefixed "my-"), so
    // they are rendered client-side. Anything else is a genuine 404.
    if (!id.startsWith("my-")) notFound();
    return <UserListingDetail id={id} />;
  }

  // Live review statistics (count, average, category averages) from Supabase.
  const stats = await getListingStats(id);
  const rating = stats && stats.count > 0 ? stats.rating : listing.rating;
  const reviewCount = stats ? stats.count : listing.reviews;

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

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{listing.title}</h1>
          <ShareButton title={listing.title} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-dim)]">
          <span className="flex items-center gap-1 text-[var(--text)]">
            <Star size={14} weight="fill" color="var(--star)" /> {rating.toFixed(2)}
          </span>
          <span>
            · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
          {listing.superhost && <span>· Superhost</span>}
          <span>
            · {listing.location}, {listing.country}
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
                  {listing.host.trips} trips hosted · Host since {listing.host.since}
                </p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-lg font-bold text-white">
                {listing.host.name[0]}
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

            <ReviewsSection listingId={listing.id} rating={rating} reviews={reviewCount} />

            <LocationMap
              lat={listing.lat}
              lng={listing.lng}
              location={listing.location}
              country={listing.country}
            />

            <InquiryForm listingId={listing.id} hostName={listing.host.name} />
          </div>

          <div>
            <BookingWidget listing={listing} rating={rating} reviewCount={reviewCount} />
          </div>
        </div>

        <SimilarStays category={listing.category} currentId={listing.id} />
        <RecordView listing={listing} />
      </main>

      <SiteFooter />
    </div>
  );
}
