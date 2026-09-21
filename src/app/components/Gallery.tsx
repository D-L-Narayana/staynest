"use client";

import { useHydrated } from "@/lib/storage";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, CaretLeft, CaretRight, Images } from "@phosphor-icons/react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const mounted = useHydrated();
  const count = images.length;

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };
  const prev = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, prev, next]);

  const main = images[0];
  const thumbs = images.slice(1, 5);
  const fillers = Math.max(0, 4 - thumbs.length);

  return (
    <>
      <div className="relative mt-5">
        <div className="grid gap-2 overflow-hidden rounded-2xl sm:grid-cols-2">
          <button
            onClick={() => openAt(0)}
            className="group relative block cursor-zoom-in"
            aria-label="Open photo gallery"
          >
            <img
              src={main}
              alt={title}
              className="h-64 w-full object-cover transition duration-500 group-hover:brightness-95 sm:h-[440px]"
            />
          </button>
          <div className="grid grid-cols-2 gap-2">
            {thumbs.map((src, i) => (
              <button
                key={i}
                onClick={() => openAt(i + 1)}
                className="group hidden cursor-zoom-in sm:block"
                aria-label={`Open photo ${i + 2}`}
              >
                <img
                  src={src}
                  alt={`${title} photo ${i + 2}`}
                  className="h-[214px] w-full object-cover transition duration-500 group-hover:brightness-95"
                />
              </button>
            ))}
            {Array.from({ length: fillers }).map((_, i) => (
              <div key={`f-${i}`} className="hidden sm:block">
                <img src={main} alt="" className="h-[214px] w-full object-cover opacity-70" />
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <button
            onClick={() => openAt(0)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-[#222] bg-white px-3 py-1.5 text-sm font-semibold text-[#222] shadow transition hover:scale-[1.02] active:scale-95"
          >
            <Images size={16} weight="bold" /> Show all {count} photos
          </button>
        )}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[3000] flex flex-col bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between px-5 py-4 text-white">
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close gallery"
                    className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                  <span className="text-sm tabular-nums">
                    {idx + 1} / {count}
                  </span>
                  <span className="w-9" />
                </div>

                <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
                  {count > 1 && (
                    <button
                      onClick={prev}
                      aria-label="Previous photo"
                      className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#222] shadow transition hover:scale-105 active:scale-95 sm:left-6"
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={idx}
                      src={images[idx]}
                      alt={`${title} photo ${idx + 1}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="max-h-full max-w-[90%] rounded-xl object-contain"
                    />
                  </AnimatePresence>
                  {count > 1 && (
                    <button
                      onClick={next}
                      aria-label="Next photo"
                      className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#222] shadow transition hover:scale-105 active:scale-95 sm:right-6"
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
