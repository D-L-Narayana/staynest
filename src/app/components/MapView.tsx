"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Star } from "@phosphor-icons/react";
import type { Listing } from "@/lib/listings";

function priceIcon(price: number, active: boolean) {
  const bg = active ? "var(--brand)" : "var(--surface)";
  const color = active ? "#ffffff" : "var(--text)";
  return L.divIcon({
    className: "sn-price-pin",
    html: `<div style="
        display:inline-flex;align-items:center;justify-content:center;
        background:${bg};
        color:${color};
        border:1px solid var(--border);
        box-shadow:0 2px 10px rgba(0,0,0,0.22);
        font-weight:700;font-size:13px;line-height:1;
        height:28px;padding:0 11px;border-radius:14px;
        white-space:nowrap;box-sizing:border-box;
        transform:translate(-50%,-50%);
        font-family:inherit;">$${price}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 9);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }, [map, points]);
  return null;
}

export default function MapView({
  listings,
  likedIds = [],
}: {
  listings: Listing[];
  likedIds?: string[];
}) {
  const valid = useMemo(() => listings.filter((l) => !(l.lat === 0 && l.lng === 0)), [listings]);
  const points = useMemo<[number, number][]>(() => valid.map((l) => [l.lat, l.lng]), [valid]);

  const center: [number, number] = points.length ? points[0] : [20, 0];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
      <MapContainer
        center={center}
        zoom={3}
        scrollWheelZoom
        style={{ height: "640px", width: "100%", background: "var(--muted)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {valid.map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={priceIcon(l.price, likedIds.includes(l.id))}
          >
            <Popup>
              <Link href={`/listing/${l.id}`} className="block w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.images[0]}
                  alt={l.title}
                  className="h-24 w-full rounded-lg object-cover"
                />
                <p className="mt-1.5 flex items-center justify-between gap-2 text-[13px] font-semibold text-[#222]">
                  <span className="truncate">{l.location}</span>
                  {l.rating > 0 && (
                    <span className="flex shrink-0 items-center gap-0.5">
                      <Star size={11} weight="fill" color="#ff385c" /> {l.rating}
                    </span>
                  )}
                </p>
                <p className="line-clamp-1 text-xs text-[#717171]">{l.title}</p>
                <p className="mt-0.5 text-[13px] text-[#222]">
                  <b>${l.price}</b> night
                </p>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
