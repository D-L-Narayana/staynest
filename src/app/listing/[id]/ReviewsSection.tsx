"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, CheckCircle, Warning, PaperPlaneTilt } from "@phosphor-icons/react";

type Review = {
  id: string;
  listing_id: string;
  author: string;
  avatar: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location_rating: number;
  value_rating: number;
  body: string;
  created_at: string;
};

const CATS: { key: keyof Review; label: string }[] = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "accuracy", label: "Accuracy" },
  { key: "communication", label: "Communication" },
  { key: "location_rating", label: "Location" },
  { key: "value_rating", label: "Value" },
];

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ReviewsSection({
  listingId,
  rating,
  reviews,
}: {
  listingId: string;
  rating: number;
  reviews: number;
}) {
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // write-a-review form
  const [name, setName] = useState("");
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/reviews?listing=${listingId}`)
      .then((r) => r.json())
      .then((j) => {
        if (active) setList(j.reviews || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [listingId]);

  const avg = (key: keyof Review) => {
    const nums = list.map((r) => Number(r[key])).filter((n) => Number.isFinite(n) && n > 0);
    if (!nums.length) return rating;
    return nums.reduce((s, n) => s + n, 0) / nums.length;
  };
  const overallAvg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : rating;

  // Until the live list arrives, show the server-rendered count (from the DB).
  const totalReviews = loading ? reviews : list.length;

  const submit = async () => {
    setFormError("");
    if (!name.trim() || !body.trim() || !stars) {
      setFormError("Add your name, a rating, and a few words.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, author: name, rating: stars, body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Could not save your review.");
      } else {
        setList((prev) => [json.review, ...prev]);
        setName("");
        setBody("");
        setStars(5);
        setPosted(true);
        setTimeout(() => setPosted(false), 4000);
      }
    } catch {
      setFormError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <section className="border-b border-[var(--border)] py-8">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Star size={20} weight="fill" color="var(--star)" />
        {overallAvg.toFixed(2)} · {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
      </h3>

      {/* category breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2">
        {[...CATS, { key: "rating" as keyof Review, label: "Overall" }].map((c) => {
          const value = c.key === "rating" ? overallAvg : avg(c.key);
          return (
            <div key={c.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-[var(--text)]">{c.label}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--text)]"
                  style={{ width: `${(value / 5) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-medium">
                {value.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* review cards */}
      {loading ? (
        <div className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-[var(--muted)]" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-[var(--muted)]" />
                  <div className="h-2.5 w-16 rounded bg-[var(--muted)]" />
                </div>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-[var(--muted)]" />
              <div className="mt-2 h-3 w-2/3 rounded bg-[var(--muted)]" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-8 text-[var(--text-dim)]">
          No reviews yet. Be the first to share your stay.
        </p>
      ) : (
        <div className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {list.map((r, i) => (
            <motion.div
              key={r.id}
              data-testid="review"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--muted)] font-semibold text-[var(--text-dim)]">
                  {r.avatar || r.author?.[0] || "G"}
                </span>
                <div className="leading-tight">
                  <p className="font-medium">{r.author}</p>
                  <p className="text-xs text-[var(--text-dim)]">{fmtDate(r.created_at)}</p>
                </div>
              </div>
              <div className="mt-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={12}
                    weight="fill"
                    color={s < r.rating ? "var(--star)" : "var(--border)"}
                  />
                ))}
              </div>
              <p className="mt-2 line-clamp-4 leading-relaxed text-[var(--text)]">{r.body}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* write a review */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] p-5">
        <h4 className="font-semibold">Write a review</h4>
        <div className="mt-3 flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]"
          />
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-sm text-[var(--text-dim)]">Rating</span>
            {Array.from({ length: 5 }).map((_, s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStars(s + 1)}
                aria-label={`${s + 1} stars`}
              >
                <Star size={22} weight="fill" color={s < stars ? "var(--star)" : "var(--border)"} />
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you love about this place?"
            rows={3}
            className="resize-none rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]"
          />
          {formError && (
            <p className="flex items-center gap-1.5 text-sm text-[var(--brand)]">
              <Warning size={15} weight="fill" /> {formError}
            </p>
          )}
          {posted && (
            <p className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle size={15} weight="fill" /> Thanks! Your review is live.
            </p>
          )}
          <button
            onClick={submit}
            disabled={submitting}
            className="self-start rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Posting..." : "Post review"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function InquiryForm({ listingId, hostName }: { listingId: string; hostName: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const send = async () => {
    setError("");
    if (!name.trim() || !message.trim()) {
      setError("Add your name and a message.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, guestName: name, message }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Could not send your message.");
      else setSent(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
        <p className="flex items-start gap-2 text-sm">
          <CheckCircle size={20} weight="fill" className="shrink-0 text-green-600" />
          <span>Message sent to {hostName}. They typically reply within an hour.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
      <h4 className="font-semibold">Message the host</h4>
      <p className="mt-1 text-sm text-[var(--text-dim)]">
        Ask {hostName} about availability, check-in, or the neighbourhood.
      </p>
      <div className="mt-3 flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hi ${hostName}, is this available for my dates?`}
          rows={3}
          className="resize-none rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]"
        />
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-[var(--brand)]">
            <Warning size={15} weight="fill" /> {error}
          </p>
        )}
        <button
          onClick={send}
          disabled={sending}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--text)] py-2.5 text-sm font-semibold transition hover:bg-[var(--muted)] active:scale-[0.99] disabled:opacity-60"
        >
          <PaperPlaneTilt size={16} weight="fill" />
          {sending ? "Sending..." : "Send message"}
        </button>
      </div>
    </div>
  );
}
