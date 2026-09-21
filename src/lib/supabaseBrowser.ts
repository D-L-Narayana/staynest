"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const hasSupabase = Boolean(url && key);

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Lazily creates the browser Supabase client. `@supabase/supabase-js` is ~240 KB
 * of JavaScript, so it is only downloaded when a visitor actually signs in or
 * already has a stored session — anonymous browsing never pays for it.
 */
export function getBrowserSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url || "https://placeholder.supabase.co", key || "placeholder-anon-key", {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    );
  }
  return clientPromise;
}

/** True when supabase-js has persisted a session for this project in localStorage. */
export function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || "";
      if (k.startsWith("sb-") && k.endsWith("-auth-token")) return true;
    }
  } catch {
    /* storage blocked */
  }
  return false;
}
