"use client";

import {
  House,
  Waves,
  Tree,
  PaintBrush,
  Sun,
  Plant,
  Mountains,
  Buildings,
  Campfire,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { CATEGORIES } from "@/lib/listings";

const ICONS: Record<string, PhosphorIcon> = {
  House,
  Waves,
  Tree,
  PaintBrush,
  Sun,
  Plant,
  Mountains,
  Buildings,
  Campfire,
};

export default function CategoryRail({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-7 overflow-x-auto border-b border-[var(--border)] px-1 py-3">
      {CATEGORIES.map((c) => {
        const Icon = ICONS[c.icon] || House;
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`group flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2 transition ${
              isActive
                ? "border-[var(--text)] text-[var(--text)]"
                : "border-transparent text-[var(--text-dim)] hover:border-[var(--border)] hover:text-[var(--text)]"
            }`}
          >
            <Icon size={24} weight={isActive ? "fill" : "regular"} />
            <span className="whitespace-nowrap text-xs font-medium">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
