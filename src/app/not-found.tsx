import Link from "next/link";
import { House, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Navbar from "./components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main className="mx-auto flex max-w-[1120px] flex-col items-center px-5 py-28 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--brand)]/10">
          <House size={32} weight="fill" className="text-[var(--brand)]" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-[var(--brand)]">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 max-w-md text-[var(--text-dim)]">
          The stay or page you&apos;re looking for may have been moved or no longer exists.
          Let&apos;s get you back to exploring.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <MagnifyingGlass size={16} weight="bold" /> Explore stays
          </Link>
          <Link
            href="/wishlist"
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--muted)]"
          >
            View wishlist
          </Link>
        </div>
      </main>
    </div>
  );
}
