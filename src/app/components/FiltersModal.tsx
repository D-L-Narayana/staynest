"use client";

import { useState, useEffect, useId, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "@phosphor-icons/react";

export type Filters = {
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  superhost: boolean;
  amenities: string[];
};

export const EMPTY_FILTERS: Filters = {
  minPrice: 0,
  maxPrice: 0,
  bedrooms: 0,
  superhost: false,
  amenities: [],
};

const AMENITIES = [
  "WiFi",
  "Kitchen",
  "Pool",
  "Hot tub",
  "Fireplace",
  "Air conditioning",
  "Free parking",
  "Workspace",
  "Beachfront",
  "Breakfast",
  "Pet friendly",
  "Washer",
];

const PRICE_CAP = 1000;

export function countActive(f: Filters) {
  let n = 0;
  if (f.minPrice > 0) n++;
  if (f.maxPrice > 0) n++;
  if (f.bedrooms > 0) n++;
  if (f.superhost) n++;
  n += f.amenities.length;
  return n;
}

export default function FiltersModal({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  // Close on Escape and restore focus to the trigger when the dialog closes.
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      openerRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && <FiltersDialog initial={initial} onClose={onClose} onApply={onApply} />}
    </AnimatePresence>
  );
}

/**
 * The form is mounted only while the dialog is open, so `useState(initial)`
 * naturally resets to the latest applied filters each time it opens — no
 * effect-driven state mirroring needed.
 */
function FiltersDialog({
  initial,
  onClose,
  onApply,
}: {
  initial: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const [f, setF] = useState<Filters>(initial);
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const toggleAmenity = (a: string) =>
    setF((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 id={titleId} className="text-base font-semibold">
            Filters
          </h3>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-[var(--muted)]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* price range */}
          <section>
            <h4 className="text-sm font-semibold">Price range</h4>
            <p className="mt-1 text-xs text-[var(--text-dim)]">Nightly price, per stay</p>
            <div className="mt-4 flex items-center gap-3">
              <label className="flex flex-1 flex-col rounded-xl border border-[var(--border)] px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">
                  Min
                </span>
                <div className="flex items-center">
                  <span className="text-sm text-[var(--text-dim)]">$</span>
                  <input
                    type="number"
                    min={0}
                    value={f.minPrice || ""}
                    placeholder="0"
                    onChange={(e) => setF((p) => ({ ...p, minPrice: Number(e.target.value) || 0 }))}
                    className="w-full bg-transparent px-1 text-sm outline-none"
                  />
                </div>
              </label>
              <span className="text-[var(--text-dim)]">–</span>
              <label className="flex flex-1 flex-col rounded-xl border border-[var(--border)] px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">
                  Max
                </span>
                <div className="flex items-center">
                  <span className="text-sm text-[var(--text-dim)]">$</span>
                  <input
                    type="number"
                    min={0}
                    value={f.maxPrice || ""}
                    placeholder={`${PRICE_CAP}+`}
                    onChange={(e) => setF((p) => ({ ...p, maxPrice: Number(e.target.value) || 0 }))}
                    className="w-full bg-transparent px-1 text-sm outline-none"
                  />
                </div>
              </label>
            </div>
            <input
              type="range"
              min={0}
              max={PRICE_CAP}
              step={10}
              value={f.maxPrice || PRICE_CAP}
              onChange={(e) => setF((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
              className="mt-4 w-full accent-[var(--brand)]"
            />
          </section>

          {/* bedrooms */}
          <section className="mt-7 border-t border-[var(--border)] pt-6">
            <h4 className="text-sm font-semibold">Bedrooms</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((b) => (
                <button
                  key={b}
                  onClick={() => setF((p) => ({ ...p, bedrooms: b }))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    f.bedrooms === b
                      ? "border-[var(--text)] bg-[var(--text)] text-[var(--surface)]"
                      : "border-[var(--border)] hover:border-[var(--text)]"
                  }`}
                >
                  {b === 0 ? "Any" : `${b}+`}
                </button>
              ))}
            </div>
          </section>

          {/* superhost */}
          <section className="mt-7 flex items-center justify-between border-t border-[var(--border)] pt-6">
            <div>
              <h4 className="text-sm font-semibold">Superhost</h4>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                Stay with highly rated, experienced hosts
              </p>
            </div>
            <button
              role="switch"
              aria-checked={f.superhost}
              onClick={() => setF((p) => ({ ...p, superhost: !p.superhost }))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                f.superhost ? "bg-[var(--brand)]" : "bg-[var(--border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  f.superhost ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </section>

          {/* amenities */}
          <section className="mt-7 border-t border-[var(--border)] pt-6">
            <h4 className="text-sm font-semibold">Amenities</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const on = f.amenities.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition ${
                      on
                        ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]"
                        : "border-[var(--border)] hover:border-[var(--text)]"
                    }`}
                  >
                    {on && <Check size={14} weight="bold" />}
                    {a}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
          <button
            onClick={() => setF(EMPTY_FILTERS)}
            className="text-sm font-semibold underline underline-offset-4 transition hover:text-[var(--brand)]"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onApply(f);
              onClose();
            }}
            className="rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] active:scale-[0.98]"
          >
            Show results
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
}
