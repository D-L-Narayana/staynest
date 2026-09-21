import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { themeNoFlashScript } from "@/lib/theme";
import Providers from "./components/Providers";
import Toaster from "./components/Toaster";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://staynest-two.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StayNest — Find your next stay",
    template: "%s · StayNest",
  },
  description:
    "Book unique places to stay around the world. A full-stack Airbnb-style booking app with live availability, real guest reviews and a Supabase backend, built by D L Narayana.",
  applicationName: "StayNest",
  authors: [{ name: "D L Narayana", url: "https://github.com/D-L-Narayana" }],
  keywords: ["stays", "vacation rentals", "booking", "Next.js", "React", "Supabase"],
  openGraph: {
    type: "website",
    siteName: "StayNest",
    title: "StayNest — Find your next stay",
    description:
      "16 hand-picked stays in 12 countries with live availability and real guest reviews.",
    url: SITE_URL,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "StayNest — find your next stay" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StayNest — Find your next stay",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="pb-16 md:pb-0">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
