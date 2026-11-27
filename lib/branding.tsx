"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Branding = { platformName: string; logoUrl: string | null; logoDarkUrl: string | null };

const DEFAULT_BRANDING: Branding = { platformName: "CleanCSV", logoUrl: null, logoDarkUrl: null };

const BrandingContext = createContext<Branding>(DEFAULT_BRANDING);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  useEffect(() => {
    let active = true;
    fetch("/api/branding", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("branding unavailable"))))
      .then((data: Branding) => {
        if (active && data.platformName) setBranding(data);
      })
      .catch(() => {
        // Keep defaults; branding is cosmetic and must never block the app.
      });
    // Re-sync when the admin publishes (same-tab) and when returning to the tab.
    const onFocus = () => {
      fetch("/api/branding")
        .then((r) => r.json())
        .then((data: Branding) => {
          if (active && data.platformName) setBranding(data);
        })
        .catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    // BRD-01: browser title follows the platform name.
    document.title = `${branding.platformName} — Enterprise Data Quality Platform`;
  }, [branding.platformName]);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding(): Branding {
  return useContext(BrandingContext);
}
