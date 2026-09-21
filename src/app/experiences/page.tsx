"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, Clock, UsersThree, Sparkle, Handshake } from "@phosphor-icons/react";
import Navbar from "../components/Navbar";

type Experience = {
  id: string;
  title: string;
  location: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  group_size?: string;
  groupSize?: string;
  host: string;
  image: string;
  description: string;
};

type Service = {
  id: string;
  title: string;
  category: string;
  provider: string;
  price_from?: number;
  priceFrom?: number;
  unit: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
};

export default function ExperiencesPage() {
  const [tab, setTab] = useState<"experiences" | "services">("experiences");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  // Which tabs have finished loading; `loading` is derived instead of mirrored.
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const loading = !loaded[tab] && !failed[tab];

  useEffect(() => {
    if (loaded[tab] || failed[tab]) return;
    let active = true;
    const url =
      tab === "services" ? "/api/experiences?kind=services" : "/api/experiences?kind=experiences";
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        if (!active) return;
        if (tab === "services") setServices(j.items || []);
        else setExperiences(j.items || []);
        setLoaded((prev) => ({ ...prev, [tab]: true }));
      })
      .catch(() => {
        if (active) setFailed((prev) => ({ ...prev, [tab]: true }));
      });
    return () => {
      active = false;
    };
  }, [tab, loaded, failed]);

  const retry = () => setFailed((prev) => ({ ...prev, [tab]: false }));

  return (
    <div className="min-h-[100dvh]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(70% 60% at 85% 0%, color-mix(in srgb, var(--brand) 14%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-[1200px] px-5 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Do something you&apos;ll{" "}
            <span className="text-[var(--brand)]">remember for years.</span>
          </motion.h1>
          <p className="mt-3 max-w-xl text-[var(--text-dim)]">
            Book hands-on experiences led by locals, or add a vetted service to your stay. From
            pasta with a nonna to a private chef at your door.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
            <button
              onClick={() => setTab("experiences")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "experiences"
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--text)] hover:bg-[var(--muted)]"
              }`}
            >
              <Sparkle size={16} weight={tab === "experiences" ? "fill" : "regular"} /> Experiences
            </button>
            <button
              onClick={() => setTab("services")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "services"
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--text)] hover:bg-[var(--muted)]"
              }`}
            >
              <Handshake size={16} weight={tab === "services" ? "fill" : "regular"} /> Services
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-5 py-8">
        {failed[tab] ? (
          <div
            role="alert"
            className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-20 text-center"
          >
            <p className="font-semibold">We couldn&apos;t load {tab} right now.</p>
            <button
              onClick={retry}
              className="mt-5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-[var(--muted)]" />
                <div className="mt-3 h-4 w-2/3 rounded bg-[var(--muted)]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[var(--muted)]" />
              </div>
            ))}
          </div>
        ) : tab === "experiences" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-[var(--border)] transition hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[var(--muted)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.image}
                    alt={e.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                    <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 font-medium">
                      {e.category}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--text)]">
                      <Star size={12} weight="fill" color="var(--star)" />
                      {e.rating} ({e.reviews})
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug">{e.title}</h3>
                  <p className="text-sm text-[var(--text-dim)]">{e.location}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--text-dim)]">
                    {e.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-dim)]">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {e.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersThree size={14} /> {e.group_size || e.groupSize}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <p className="text-sm">
                      <span className="font-semibold">${e.price}</span>
                      <span className="text-[var(--text-dim)]"> / person</span>
                    </p>
                    <span className="text-xs text-[var(--text-dim)]">Hosted by {e.host}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-[var(--border)] transition hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[var(--muted)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                    <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 font-medium">
                      {s.category}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--text)]">
                      <Star size={12} weight="fill" color="var(--star)" />
                      {s.rating} ({s.reviews})
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug">{s.title}</h3>
                  <p className="text-sm text-[var(--text-dim)]">{s.provider}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--text-dim)]">
                    {s.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <p className="text-sm">
                      <span className="text-[var(--text-dim)]">From </span>
                      <span className="font-semibold">${s.price_from || s.priceFrom}</span>
                      <span className="text-[var(--text-dim)]"> {s.unit}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-[var(--text-dim)]">
          <span>Built by D L Narayana</span>
          <span>Next.js · Supabase · Motion</span>
        </div>
      </footer>
    </div>
  );
}
