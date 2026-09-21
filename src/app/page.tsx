import { preload } from "react-dom";
import Home from "./HomeClient";
import { getSiteStats } from "@/lib/stats.server";

// Static page, revalidated so the hero numbers track the database.
export const revalidate = 300;

export default async function Page() {
  // Hint the browser about the hero poster (the LCP element) before the client bundle runs.
  preload("/landing/hero.jpg", { as: "image", fetchPriority: "high" });
  const stats = await getSiteStats();
  return <Home stats={stats} />;
}
