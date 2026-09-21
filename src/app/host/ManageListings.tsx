"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Plus, PencilSimple, Trash, X, House, ArrowSquareOut } from "@phosphor-icons/react";
import { CATEGORIES } from "@/lib/listings";
import { useUserListings, listingToDraft, type ListingDraft } from "@/lib/userListings";
import type { Listing } from "@/lib/listings";

const EMPTY_DRAFT: ListingDraft = {
  title: "",
  location: "",
  country: "",
  type: "Entire place",
  category: "design",
  price: 150,
  guests: 2,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  superhost: false,
  description: "",
  image: "",
  amenities: ["WiFi", "Kitchen"],
  lat: 0,
  lng: 0,
  hostName: "You",
};

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.id !== "all");

export default function ManageListings() {
  const { listings, ready, upsert, remove } = useUserListings();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ListingDraft>(EMPTY_DRAFT);
  const [amenitiesText, setAmenitiesText] = useState("WiFi, Kitchen");

  const startCreate = () => {
    setDraft(EMPTY_DRAFT);
    setAmenitiesText("WiFi, Kitchen");
    setOpen(true);
  };

  const startEdit = (l: Listing) => {
    const d = listingToDraft(l);
    setDraft(d);
    setAmenitiesText(d.amenities.join(", "));
    setOpen(true);
  };

  const save = () => {
    const amenities = amenitiesText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    upsert({ ...draft, amenities });
    setOpen(false);
  };

  const set = <K extends keyof ListingDraft>(k: K, v: ListingDraft[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  return (
    <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <House size={18} weight="fill" /> Your listings
          {ready && (
            <span className="text-sm font-normal text-[var(--text-dim)]">({listings.length})</span>
          )}
        </h2>
        <button
          onClick={startCreate}
          className="flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" /> Add listing
        </button>
      </div>

      {ready && listings.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
          <p className="text-sm font-medium">No listings yet</p>
          <p className="mt-1 text-sm text-[var(--text-dim)]">
            Add your first stay. It will appear in search results and on the map.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-xl border border-[var(--border)]">
              <div className="relative aspect-[4/3] bg-[var(--muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.images[0]} alt={l.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{l.title}</p>
                <p className="truncate text-xs text-[var(--text-dim)]">
                  {l.location} · ${l.price}/night
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(l)}
                    className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition hover:bg-[var(--muted)]"
                  >
                    <PencilSimple size={13} /> Edit
                  </button>
                  <Link
                    href={`/listing/${l.id}`}
                    className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition hover:bg-[var(--muted)]"
                  >
                    <ArrowSquareOut size={13} /> View
                  </Link>
                  <button
                    onClick={() => remove(l.id)}
                    className="ml-auto flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--brand)] transition hover:bg-[var(--muted)]"
                  >
                    <Trash size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* editor modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:rounded-3xl"
            >
              <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <h3 className="text-base font-semibold">
                  {draft.id ? "Edit listing" : "New listing"}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-[var(--muted)]"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <Field label="Title">
                  <input
                    value={draft.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Cliffside villa with infinity pool"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="City / area">
                    <input
                      value={draft.location}
                      onChange={(e) => set("location", e.target.value)}
                      placeholder="Amalfi Coast"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={draft.country}
                      onChange={(e) => set("country", e.target.value)}
                      placeholder="Italy"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Place type">
                    <input
                      value={draft.type}
                      onChange={(e) => set("type", e.target.value)}
                      placeholder="Entire villa"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      value={draft.category}
                      onChange={(e) => set("category", e.target.value)}
                      className={inputCls}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="Price / night ($)">
                    <input
                      type="number"
                      min={1}
                      value={draft.price}
                      onChange={(e) => set("price", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Guests">
                    <input
                      type="number"
                      min={1}
                      value={draft.guests}
                      onChange={(e) => set("guests", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Bedrooms">
                    <input
                      type="number"
                      min={0}
                      value={draft.bedrooms}
                      onChange={(e) => set("bedrooms", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Baths">
                    <input
                      type="number"
                      min={1}
                      value={draft.baths}
                      onChange={(e) => set("baths", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Cover image URL">
                  <input
                    value={draft.image}
                    onChange={(e) => set("image", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={inputCls}
                  />
                </Field>

                <Field label="Amenities (comma separated)">
                  <input
                    value={amenitiesText}
                    onChange={(e) => setAmenitiesText(e.target.value)}
                    placeholder="WiFi, Kitchen, Pool"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Latitude (optional)">
                    <input
                      type="number"
                      step="any"
                      value={draft.lat || ""}
                      onChange={(e) => set("lat", Number(e.target.value) || 0)}
                      placeholder="40.634"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Longitude (optional)">
                    <input
                      type="number"
                      step="any"
                      value={draft.lng || ""}
                      onChange={(e) => set("lng", Number(e.target.value) || 0)}
                      placeholder="14.602"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    value={draft.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                    placeholder="Tell guests what makes this place special."
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={draft.superhost}
                    onChange={(e) => set("superhost", e.target.checked)}
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  <span className="text-sm">Mark as Superhost listing</span>
                </label>
              </div>

              <footer className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] active:scale-[0.98]"
                >
                  {draft.id ? "Save changes" : "Publish listing"}
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">
        {label}
      </span>
      {children}
    </label>
  );
}
