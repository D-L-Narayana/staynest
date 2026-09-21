import { NextResponse } from "next/server";
import { LISTINGS } from "@/lib/listings";
import { supabase, hasSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Host dashboard stats. Real bookings come from Supabase; we blend them with
// a deterministic baseline so the dashboard is never empty in a demo.
export async function GET() {
  type Booking = {
    code: string;
    listing_id: string;
    listing_title: string;
    location: string;
    image: string;
    check_in: string;
    check_out: string;
    nights: number;
    guests: number;
    total: number;
    booked_at: string;
  };

  let bookings: Booking[] = [];
  if (hasSupabase) {
    const { data } = await supabase
      .from("staynest_bookings")
      .select("*")
      .order("booked_at", { ascending: false })
      .limit(200);
    bookings = (data as Booking[]) || [];
  }

  const realRevenue = bookings.reduce((s, b) => s + (b.total || 0), 0);
  const realNights = bookings.reduce((s, b) => s + (b.nights || 0), 0);

  // Baseline so a fresh demo still shows a believable business.
  const baselineRevenue = 184250;
  const baselineNights = 612;
  const baselineBookings = 138;

  const totalRevenue = baselineRevenue + realRevenue;
  const totalNights = baselineNights + realNights;
  const totalBookings = baselineBookings + bookings.length;

  // Per-listing performance (deterministic but varied).
  const listingPerf = LISTINGS.map((l, i) => {
    const occupancy = 58 + ((i * 7 + l.reviews) % 38); // 58-95%
    const bookingsCount =
      bookings.filter((b) => b.listing_id === l.id).length + ((l.reviews % 9) + 3);
    const revenue = Math.round(l.price * (occupancy / 100) * 30 * 1.0);
    return {
      id: l.id,
      title: l.title,
      location: l.location,
      image: l.images[0],
      price: l.price,
      rating: l.rating,
      reviews: l.reviews,
      occupancy,
      bookings: bookingsCount,
      revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const avgOccupancy = Math.round(
    listingPerf.reduce((s, l) => s + l.occupancy, 0) / listingPerf.length
  );
  const avgRating =
    Math.round((LISTINGS.reduce((s, l) => s + l.rating, 0) / LISTINGS.length) * 100) / 100;

  // 6-month revenue trend (deterministic baseline + recent real bookings nudged in).
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const base = [22400, 19850, 26100, 31200, 34800, 41900];
  const trend = months.map((m, i) => ({
    month: m,
    revenue: base[i] + (i === months.length - 1 ? realRevenue : 0),
  }));

  return NextResponse.json({
    summary: {
      totalRevenue,
      totalNights,
      totalBookings,
      avgOccupancy,
      avgRating,
      activeListings: LISTINGS.length,
    },
    trend,
    listings: listingPerf,
    recentBookings: bookings.slice(0, 8),
  });
}
