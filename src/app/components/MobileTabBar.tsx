"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseLine,
  SuitcaseRolling,
  Heart,
  ChartLineUp,
  AirplaneTilt,
} from "@phosphor-icons/react";

const TABS = [
  { href: "/", label: "Stays", icon: HouseLine },
  { href: "/experiences", label: "Explore", icon: SuitcaseRolling },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/trips", label: "Trips", icon: AirplaneTilt },
  { href: "/host", label: "Host", icon: ChartLineUp },
];

/**
 * Bottom tab bar for small screens (< md). The desktop nav lives in the header;
 * without this, phone users had no way to reach Experiences, Wishlist or Trips.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
                  active ? "text-[var(--brand)]" : "text-[var(--text-dim)]"
                }`}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
