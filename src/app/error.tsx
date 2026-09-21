"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[100dvh] place-items-center px-5 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
          Something went wrong
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">We couldn&apos;t load this page</h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--text-dim)]">
          The error has been logged. You can try again, or head back to the stays.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-[var(--text-dim)]">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--muted)]"
          >
            Back to stays
          </Link>
        </div>
      </div>
    </main>
  );
}
