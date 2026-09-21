"use client";

import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { UIProvider, useUI } from "@/lib/ui";
import { WishlistProvider } from "@/lib/wishlist";
import Assistant from "./Assistant";
import AuthModal from "./AuthModal";
import MobileTabBar from "./MobileTabBar";

function GlobalOverlays() {
  const { authOpen, closeAuth } = useUI();
  return (
    <>
      <Assistant />
      <AuthModal open={authOpen} onClose={closeAuth} />
      <MobileTabBar />
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          <WishlistProvider>
            {children}
            <GlobalOverlays />
          </WishlistProvider>
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
