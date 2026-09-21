"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PaperPlaneTilt, Sparkle, MagnifyingGlass } from "@phosphor-icons/react";
import { KB, FEATURED, type QA } from "@/lib/chatbot-kb";

type Msg = { role: "user" | "bot"; text: string };

function score(query: string, q: string): number {
  const ql = query.toLowerCase().trim();
  const target = q.toLowerCase();
  if (!ql) return 0;
  if (target === ql + "?") return 100;
  if (target.includes(ql)) return 70 + Math.min(ql.length / 2, 20);
  // token overlap
  const qt = ql.split(/\s+/).filter((w) => w.length > 2);
  const tt = new Set(target.split(/\s+/));
  let hits = 0;
  for (const w of qt) if (tt.has(w) || [...tt].some((t) => t.includes(w))) hits++;
  return qt.length ? (hits / qt.length) * 50 : 0;
}

function suggest(query: string): QA[] {
  if (!query.trim()) {
    return FEATURED.map((f) => KB.find((k) => k.canon === f)!).filter(Boolean);
  }
  const seen = new Set<number>();
  return KB.map((k) => ({ k, s: score(query, k.q) }))
    .filter((x) => x.s > 12)
    .sort((a, b) => b.s - a.s)
    .filter((x) => {
      if (seen.has(x.k.topic)) return false;
      seen.add(x.k.topic);
      return true;
    })
    .slice(0, 6)
    .map((x) => x.k);
}

export default function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi, I am Nestor, your StayNest guide. Ask me anything, or pick a question below to get started.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => suggest(query), [query]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Escape closes the panel for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ask = (qa: QA) => {
    setMessages((m) => [...m, { role: "user", text: qa.canon }, { role: "bot", text: qa.a }]);
    setQuery("");
  };

  const submitFree = () => {
    if (!query.trim()) return;
    const best = suggestions[0];
    if (best) {
      ask(best);
    } else {
      setMessages((m) => [
        ...m,
        { role: "user", text: query },
        {
          role: "bot",
          text: "I am not sure about that one yet. Try rephrasing, or pick one of the suggested questions. I can help with booking, wishlists, reviews, themes, accounts, experiences, and more.",
        },
      ]);
      setQuery("");
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            id="staynest-assistant"
            role="dialog"
            aria-label="Nestor assistant"
            className="fixed bottom-[9.5rem] right-4 z-50 md:bottom-24 md:right-5 flex h-[34rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
          >
            {/* header */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--brand)] px-4 py-3 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                <Sparkle size={18} weight="fill" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Nestor</p>
                <p className="text-xs text-white/80">Your StayNest guide</p>
              </div>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--muted)] text-[var(--text)]"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* suggestions */}
              <div className="pt-1">
                <p className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
                  <MagnifyingGlass size={12} />
                  {query ? "Matching questions" : "Popular questions"}
                </p>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s.q}
                      onClick={() => ask(s)}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-left text-[13px] text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                    >
                      {s.canon}
                    </button>
                  ))}
                  {suggestions.length === 0 && (
                    <p className="text-[13px] text-[var(--text-dim)]">
                      No match. Try fewer or different words.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* input */}
            <div className="flex items-center gap-2 border-t border-[var(--border)] p-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitFree()}
                placeholder="Type your question..."
                className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
              />
              <button
                onClick={submitFree}
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white transition hover:bg-[var(--brand-dark)] active:scale-95"
              >
                <PaperPlaneTilt size={16} weight="fill" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
