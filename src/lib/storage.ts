"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny, typed localStorage store built on `useSyncExternalStore`.
 *
 * Why: reading localStorage inside `useEffect` and mirroring it into state
 * causes an extra render per mount and trips the React 19
 * `react-hooks/set-state-in-effect` rule. An external store gives every
 * consumer the same snapshot, updates all subscribers (including other tabs
 * through the `storage` event) and renders the server fallback during SSR.
 */
export type LocalStore<T> = {
  key: string;
  read: () => T;
  write: (next: T | ((prev: T) => T)) => T;
  subscribe: (cb: () => void) => () => void;
  useValue: () => T;
};

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function emit(key: string) {
  listeners.get(key)?.forEach((cb) => cb());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && listeners.has(e.key)) emit(e.key);
  });
}

export function createLocalStore<T>(key: string, fallback: T): LocalStore<T> {
  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return fallback;
    }
    const hit = cache.get(key);
    // Return a referentially stable value while the serialized form is unchanged
    // so `useSyncExternalStore` does not re-render on every read.
    if (hit && hit.raw === raw) return hit.value as T;
    let value: T = fallback;
    if (raw !== null) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = fallback;
      }
    }
    cache.set(key, { raw, value });
    return value;
  };

  const write = (next: T | ((prev: T) => T)): T => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(read()) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage may be full or disabled — keep the in-memory value */
    }
    cache.set(key, { raw: JSON.stringify(value), value });
    emit(key);
    return value;
  };

  const subscribe = (cb: () => void) => {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(cb);
    return () => {
      set?.delete(cb);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, read, () => fallback);

  return { key, read, write, subscribe, useValue };
}

const noop = () => () => {};

/** `true` once the component has hydrated on the client (false during SSR). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}
