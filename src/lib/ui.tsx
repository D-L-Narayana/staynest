"use client";

import { createContext, useContext, useState, useCallback } from "react";

type UICtx = {
  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
};

const Ctx = createContext<UICtx | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  return <Ctx.Provider value={{ authOpen, openAuth, closeAuth }}>{children}</Ctx.Provider>;
}

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
