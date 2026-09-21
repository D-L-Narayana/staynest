import type { MetadataRoute } from "next";
import { LISTINGS } from "@/lib/listings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://staynest-two.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/experiences`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/host`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...LISTINGS.map((l) => ({
      url: `${SITE_URL}/listing/${l.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
