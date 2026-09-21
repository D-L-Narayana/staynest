import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://staynest-two.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/trips", "/wishlist"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
