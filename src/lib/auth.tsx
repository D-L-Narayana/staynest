"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase, hasStoredSession, hasSupabase } from "./supabaseBrowser";
import { createLocalStore } from "@/lib/storage";

const GUEST_KEY = "staynest.guest.v1";
const guestStore = createLocalStore<boolean>(GUEST_KEY + ".json", false);

type AuthState = {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
  displayName: string;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const isGuest = guestStore.useValue();
  // Nothing to load when Supabase is not configured.
  const [loading, setLoading] = useState(hasSupabase);

  // Subscribe to auth changes exactly once, the first time the client is loaded.
  const subscribed = useRef(false);
  const ensureClient = useCallback(async () => {
    const sb = await getBrowserSupabase();
    if (!subscribed.current) {
      subscribed.current = true;
      sb.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) guestStore.write(false);
      });
    }
    return sb;
  }, []);

  useEffect(() => {
    if (!hasSupabase) return;
    let cancelled = false;
    // Only download supabase-js on load when there is a session to restore.
    const restore = hasStoredSession()
      ? ensureClient().then((sb) => sb.auth.getSession())
      : Promise.resolve({ data: { session: null } });
    restore.then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ensureClient]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!hasSupabase) return { error: "Auth is not configured." };
      const sb = await ensureClient();
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      return {};
    },
    [ensureClient]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!hasSupabase) return { error: "Auth is not configured." };
      const sb = await ensureClient();
      const { error } = await sb.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return {};
    },
    [ensureClient]
  );

  const signOut = useCallback(async () => {
    if (hasSupabase) {
      const sb = await ensureClient();
      await sb.auth.signOut();
    }
    guestStore.write(false);
  }, [ensureClient]);

  /** Demo/guest mode: full UI without an account (persisted per browser). */
  const continueAsGuest = useCallback(() => {
    guestStore.write(true);
  }, []);

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    (isGuest ? "Guest" : "");

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isGuest,
        loading,
        displayName,
        signUp,
        signIn,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
