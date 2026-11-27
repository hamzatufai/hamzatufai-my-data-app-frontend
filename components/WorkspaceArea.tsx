"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { getSessionToken, fetchSession, authRequest, type SessionInfo } from "@/lib/auth";

const WORKSPACE_PATHS = [
  "/", "/import", "/datasets", "/profiling", "/export", "/history", "/settings",
];

const isWorkspacePath = (pathname: string) =>
  WORKSPACE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

function destinationFor(status: string | undefined): string {
  if (status === "unverified") return "/status?state=unverified";
  if (status === "pending") return "/status?state=pending";
  return "/access-request";
}

/**
 * Workspace shell — ACC-05 client layer.
 *
 * The left sidebar is part of the approved workspace: visitors and
 * unapproved accounts never see it. They are redirected to the standalone
 * sign-in / status pages. Server-side 401/403s enforce the same rule on API
 * calls; this shell only provides correct routing UX.
 */
export default function WorkspaceArea({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [checked, setChecked] = useState(false);
  const showShell = isWorkspacePath(pathname);

  useEffect(() => {
    if (!showShell) {
      setChecked(true);
      return;
    }

    if (!getSessionToken()) {
      router.replace("/signin");
      return;
    }

    let active = true;
    fetchSession().then((info) => {
      if (!active) return;
      setSession(info);
      setChecked(true);

      if (info.status === "suspended" || info.status === "deleted") {
        void authRequest("POST", "/api/auth/logout").catch(() => undefined);
        router.replace("/signin?state=suspended");
        return;
      }
      if (info.role === "admin") {
        router.replace("/admin");
        return;
      }
      if (!info.authenticated) {
        router.replace("/signin");
        return;
      }
      if (info.status !== "approved") {
        router.replace(destinationFor(info.status));
      }
    });
    return () => { active = false; };
  }, [showShell, pathname, router]);

  // Auth/admin pages: plain full-width content, never the sidebar.
  if (!showShell) return <main className="min-w-0 flex-1">{children}</main>;

  if (!checked) {
    return <main className="min-w-0 flex-1"><p className="py-24 text-center text-sm text-slate-500">Checking access…</p></main>;
  }

  const approvedUser =
    session?.authenticated && session.status === "approved" && session.role !== "admin";

  if (!approvedUser) {
    return <main className="min-w-0 flex-1"><p className="py-24 text-center text-sm text-slate-500">Checking access…</p></main>;
  }

  // Approved: the full workspace with the left navigation bar.
  return (
    <main className="min-w-0 flex-1 flex gap-6">
      <Sidebar />
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
    </main>
  );
}
