"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { authRequest, getSessionToken } from "@/lib/auth";

const TABS = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Requests", href: "/admin/requests" },
  { label: "Branding", href: "/admin/branding" },
  { label: "Audit log", href: "/admin/audit" },
];

export default function AdminShell({
  title,
  subtitle,
  children,
  requireAdmin = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(!requireAdmin);
  const [name, setName] = useState("CleanCSV");

  useEffect(() => {
    fetch("/api/branding")
      .then((r) => r.json())
      .then((b: { platformName?: string }) => setName(b.platformName ?? "CleanCSV"))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      router.replace("/admin/signin");
      return;
    }
    authRequest<{ role?: string }>("GET", "/api/admin/metrics")
      .then(() => setChecked(true))
      .catch(() => {
        router.replace("/admin/signin");
      });
  }, [router]);

  return (
    <div className="glass p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">{name} — Admin</p>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={async () => {
            await authRequest("POST", "/api/auth/logout");
            localStorage.removeItem("cleancsv:session");
            router.push("/admin/signin");
          }}
          className="rounded-lg border border-line px-3 py-2 text-xs text-slate-400 hover:text-white"
        >
          Sign out
        </button>
      </div>

      {requireAdmin ? (
        checked ? (
          <>
            <nav className="mt-6 flex flex-wrap gap-1 border-b border-line text-sm" aria-label="Admin sections">
              {TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={pathname === tab.href ? "page" : undefined}
                  className={`rounded-t-lg px-3 py-2 ${
                    pathname === tab.href ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
            <div className="pt-6">{children}</div>
          </>
        ) : (
          <p className="py-16 text-center text-sm text-slate-500">Checking administrator session…</p>
        )
      ) : (
        <div className="pt-6">{children}</div>
      )}
    </div>
  );
}
