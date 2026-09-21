"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Desktop, Palette, Check } from "@phosphor-icons/react";
import { useTheme, ACCENTS, type ThemeMode } from "@/lib/theme";

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Desktop },
];

export default function ThemeSwitcher() {
  const { mode, accent, setMode, setAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const Active = MODES.find((m) => m.id === mode)?.icon || Desktop;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Theme settings"
        className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-[var(--text)] transition hover:bg-[var(--muted)]"
      >
        <Active size={18} weight="fill" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]"
          >
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">
              Appearance
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {MODES.map((m) => {
                const Icon = m.icon;
                const on = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    aria-pressed={on}
                    data-testid={`theme-${m.id}`}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs transition ${
                      on
                        ? "border-[var(--brand)] text-[var(--brand)]"
                        : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Icon size={18} weight={on ? "fill" : "regular"} />
                    {m.label}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-3 flex items-center gap-1 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">
              <Palette size={12} /> Accent
            </p>
            <div className="flex items-center justify-between px-1">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  aria-label={a.label}
                  className="grid h-8 w-8 place-items-center rounded-full transition active:scale-90"
                  style={{ backgroundColor: a.color }}
                >
                  {accent === a.id && <Check size={15} weight="bold" color="#fff" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
