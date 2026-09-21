"use client";

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Accent = "coral" | "ocean" | "forest" | "violet" | "sunset";

export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: "coral", label: "Coral", color: "#ff385c" },
  { id: "ocean", label: "Ocean", color: "#0d6efd" },
  { id: "forest", label: "Forest", color: "#1a9d63" },
  { id: "violet", label: "Violet", color: "#7c4dff" },
  { id: "sunset", label: "Sunset", color: "#f4631e" },
];

const THEME_KEY = "staynest.theme.v1";
const ACCENT_KEY = "staynest.accent.v1";

type Ctx = {
  mode: ThemeMode;
  accent: Accent;
  resolved: "light" | "dark";
  setMode: (m: ThemeMode) => void;
  setAccent: (a: Accent) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

const MODES: ThemeMode[] = ["light", "dark", "system"];
const ACCENT_IDS = ACCENTS.map((a) => a.id);

// Preferences are stored as plain strings (not JSON) so the no-flash inline
// script below can read them without parsing.
function readPref<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

const prefListeners = new Set<() => void>();
function emitPref() {
  prefListeners.forEach((cb) => cb());
}
function subscribePrefs(cb: () => void) {
  prefListeners.add(cb);
  const mql =
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  mql?.addEventListener("change", cb);
  window.addEventListener("storage", cb);
  return () => {
    prefListeners.delete(cb);
    mql?.removeEventListener("change", cb);
    window.removeEventListener("storage", cb);
  };
}

function systemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveMode(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  return mode === "dark" || (mode === "system" && prefersDark) ? "dark" : "light";
}

function applyTheme(mode: ThemeMode, accent: Accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolveMode(mode, systemPrefersDark()));
  root.setAttribute("data-accent", accent);
  root.style.colorScheme = resolveMode(mode, systemPrefersDark());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // External-store reads: no effect → setState round trip, no hydration flash
  // (the server snapshot matches the inline no-flash script defaults).
  const mode = useSyncExternalStore(
    subscribePrefs,
    () => readPref(THEME_KEY, MODES, "system"),
    () => "system" as ThemeMode
  );
  const accent = useSyncExternalStore(
    subscribePrefs,
    () => readPref(ACCENT_KEY, ACCENT_IDS, "coral"),
    () => "coral" as Accent
  );
  const prefersDark = useSyncExternalStore(subscribePrefs, systemPrefersDark, () => false);
  const resolved = resolveMode(mode, prefersDark);

  // Keep the <html> attributes in sync with the resolved theme (external system).
  useEffect(() => {
    applyTheme(mode, accent);
  }, [mode, accent, prefersDark]);

  const setMode = useCallback((m: ThemeMode) => {
    try {
      localStorage.setItem(THEME_KEY, m);
    } catch {
      /* ignore */
    }
    emitPref();
  }, []);

  const setAccent = useCallback((a: Accent) => {
    try {
      localStorage.setItem(ACCENT_KEY, a);
    } catch {
      /* ignore */
    }
    emitPref();
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, accent, resolved, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// Inline script (string) to set theme before first paint, preventing flash.
export const themeNoFlashScript = `(function(){try{var m=localStorage.getItem('${THEME_KEY}')||'system';var a=localStorage.getItem('${ACCENT_KEY}')||'coral';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.setAttribute('data-theme',d?'dark':'light');r.setAttribute('data-accent',a);}catch(e){}})();`;
