"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Warning, Info } from "@phosphor-icons/react";
import { TOAST_EVENT, type ToastEvent } from "@/lib/toast";

const ICONS = {
  success: CheckCircle,
  error: Warning,
  default: Info,
} as const;

const ICON_COLOR = {
  success: "#22c55e",
  error: "#ef4444",
  default: "var(--brand)",
} as const;

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastEvent>).detail;
      setToasts((prev) => [...prev, detail].slice(-3));
      setTimeout(() => remove(detail.id), 3200);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, [remove]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[3000] md:bottom-6 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => remove(t.id)}
              className="pointer-events-auto flex max-w-sm cursor-pointer items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium shadow-lg"
            >
              <Icon size={18} weight="fill" color={ICON_COLOR[t.kind]} />
              <span>{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
