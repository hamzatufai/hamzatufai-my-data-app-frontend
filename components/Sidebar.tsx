"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Layers, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { DEMO_MODE, dashboardData } from "@/lib/demo";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { signal } = dashboardData;

  // Close the mobile drawer on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="glass fixed bottom-4 right-4 z-40 p-3 text-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={`glass fixed inset-y-4 left-4 z-50 flex w-60 flex-col p-4 transition-transform duration-200 lg:sticky lg:top-4 lg:inset-auto lg:h-[calc(100vh-2rem)] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2 py-1">
          <span className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <span className="text-lg font-semibold tracking-tight text-white">CleanCSV</span>
          </span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="text-slate-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon, implemented }) => {
            const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition duration-150";
            if (!implemented) {
              return (
                <span key={href} aria-disabled="true" title="Coming soon" className={`${base} cursor-not-allowed text-slate-600`}>
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                </span>
              );
            }
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${base} ${active ? "bg-accent/10 text-accent shadow-glow" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">AI Signal</p>
          {DEMO_MODE ? (
            <>
              <p className="mt-2 text-lg font-bold text-accent">{signal.label}</p>
              <p className="mt-2 text-xs text-slate-500">Confidence</p>
              <p className="text-sm font-semibold text-white">{signal.confidence}%</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${signal.confidence}%` }} />
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Signals appear after you profile a dataset.</p>
          )}
        </div>
      </aside>
    </>
  );
}
