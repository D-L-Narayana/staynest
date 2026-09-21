"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChatCircleDots, X } from "@phosphor-icons/react";

// The panel (and its ~280 KB knowledge base) is only downloaded when the
// visitor opens the assistant, keeping it out of every page's initial bundle.
const AssistantPanel = dynamic(() => import("./AssistantPanel"), { ssr: false });

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setLoaded(true);
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setLoaded(true)}
        onFocus={() => setLoaded(true)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        aria-controls="staynest-assistant"
        className="fixed bottom-20 right-4 z-50 md:bottom-5 md:right-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-[var(--shadow)] transition hover:bg-[var(--brand-dark)] active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} weight="bold" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <ChatCircleDots size={26} weight="fill" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {loaded && <AssistantPanel open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
