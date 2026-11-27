"use client";

import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import { authRequest } from "@/lib/auth";

type Metrics = {
  totalUsers: number;
  verifiedUsers: number;
  pendingRequests: number;
  approved: number;
  rejected: number;
  suspended: number;
  newSignUps7d: number;
};

const LABELS: Record<keyof Metrics, string> = {
  totalUsers: "Total users",
  verifiedUsers: "Verified",
  pendingRequests: "Pending requests",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  newSignUps7d: "New sign-ups (7d)",
};

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authRequest<{ metrics: Metrics }>("GET", "/api/admin/metrics")
      .then((r) => setMetrics(r.metrics))
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Could not load metrics."),
      );
  }, []);

  return (
    <AdminShell title="Admin overview" subtitle="Live database counts — nothing is estimated.">
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      {metrics ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(Object.keys(LABELS) as (keyof Metrics)[]).map((key) => (
            <div key={key} className="glass p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">{LABELS[key]}</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {metrics[key].toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Loading metrics…</p>
      )}
    </AdminShell>
  );
}
