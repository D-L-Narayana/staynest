"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HouseLine,
  SuitcaseRolling,
  Heart,
  ChartLineUp,
  GithubLogo,
  User,
  SignOut,
  CaretDown,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import ThemeSwitcher from "./ThemeSwitcher";

const LINKS = [
  { href: "/", label: "Stays", icon: HouseLine },
  { href: "/experiences", label: "Experiences", icon: SuitcaseRolling },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/host", label: "Host", icon: ChartLineUp },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isGuest, displayName, signOut } = useAuth();
  const { openAuth } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signedIn = Boolean(user) || isGuest;
  const initial = (displayName || "G").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[var(--brand)]">
          <HouseLine size={26} weight="fill" />
          <span className="text-xl font-bold tracking-tight">StayNest</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition hover:bg-[var(--muted)] ${
                  active ? "text-[var(--brand)]" : "text-[var(--text)]"
                }`}
              >
                <Icon size={17} weight={active ? "fill" : "regular"} /> {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          {signedIn ? (
            <div ref={ref} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] py-1 pl-1 pr-2.5 text-sm font-medium transition hover:shadow-md"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
                  {initial}
                </span>
                <span className="hidden max-w-[7rem] truncate sm:inline">{displayName}</span>
                <CaretDown size={12} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow)]"
                  >
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="truncate text-xs text-[var(--text-dim)]">
                        {user?.email || "Guest session"}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-[var(--border)]" />
                    <Link
                      href="/trips"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--muted)]"
                    >
                      <SuitcaseRolling size={16} /> My Trips
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--muted)]"
                    >
                      <Heart size={16} /> Wishlist
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--brand)] transition hover:bg-[var(--muted)]"
                    >
                      <SignOut size={16} /> {user ? "Log out" : "Exit guest"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] active:scale-[0.98]"
            >
              <User size={16} weight="fill" /> Log in
            </button>
          )}

          <a
            href="https://github.com/D-L-Narayana"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-[var(--text)] transition hover:bg-[var(--muted)] sm:grid"
          >
            <GithubLogo size={18} weight="fill" />
          </a>
        </div>
      </div>
    </header>
  );
}
