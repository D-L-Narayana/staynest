import { supabase, hasSupabase } from "@/lib/supabase";
import type { DateRange } from "@/lib/pricing";

/**
 * Server-only helpers around `staynest_bookings`.
 * Cancelled bookings (status = 'cancelled') do not block dates.
 */
export async function getBookedRanges(listingId: string, from?: string): Promise<DateRange[]> {
  if (!hasSupabase) return [];
  let q = supabase
    .from("staynest_bookings")
    .select("check_in, check_out")
    .eq("listing_id", listingId)
    .neq("status", "cancelled")
    .order("check_in", { ascending: true })
    .limit(500);
  if (from) q = q.gte("check_out", from);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map((r) => ({ checkIn: String(r.check_in), checkOut: String(r.check_out) }));
}
