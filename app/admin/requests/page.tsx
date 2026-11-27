"use client";

import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import { authRequest } from "@/lib/auth";

type RequestRow = {
  id: string;
  fullName: string;
  organisation: string;
  jobRole: string;
  intendedUse: string;
  status: string;
  reasonCode?: string;
  reasonMessage?: string;
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
  email: string;
  userId: string;
  userStatus: string;
  dataTypes?: string;
};

export default function AdminRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    authRequest<{ requests: RequestRow[]; pendingCount: number }>(
      "GET",
      `/api/admin/requests?status=${status}`,
    )
      .then((r) => { setRows(r.requests); setPendingCount(r.pendingCount); })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Could not load requests."),
      );
  }, [status]);

  async function decide(userId: string, action: "approve" | "reject") {
    let reason = "";
    if (action === "reject") {
      reason = window.prompt("Reason code (duplicate, out of scope, unknown organisation…):") ?? "";
      if (!reason) return;
    } else {
      if (!window.confirm("Approve this request? The applicant will be able to sign in.")) return;
    }
    try {
      await authRequest("POST", `/api/admin/users/${userId}`, { action, reason });
      setMessage(`Request ${action === "approve" ? "approved" : "rejected with reason: " + reason}. Applicant notified by email.`);
      // refresh
      const refreshed = await authRequest<{ requests: RequestRow[]; pendingCount: number }>(
        "GET",
        `/api/admin/requests?status=${status}`,
      );
      setRows(refreshed.requests);
      setPendingCount(refreshed.pendingCount);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Decision failed.");
    }
  }

  return (
    <AdminShell title="Access request queue" subtitle="Oldest requests first — decisions are recorded in the audit log.">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter requests"
          className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200"
        >
          {["pending", "approved", "rejected", "all"].map((s) => (
            <option key={s} value={s}>{s === "all" ? "All requests" : `${s} requests`}</option>
          ))}
        </select>
        <span className="rounded-full bg-warning/10 px-3 py-1 text-xs text-warning">
          {pendingCount} pending for review
        </span>
      </div>

      {message && <p className="mb-3 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-accent" role="status">{message}</p>}
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No {status === "all" ? "" : status + " "}requests.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="glass p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{r.fullName} <span className="text-slate-500">· {r.jobRole}{r.organisation ? ` · ${r.organisation}` : ""}</span></p>
                  <p className="text-xs text-slate-500">{r.email} · submitted {new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{r.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">“{r.intendedUse}”</p>
              {r.dataTypes && <p className="mt-1 text-xs text-slate-600">Data types: {r.dataTypes}</p>}
              {r.reasonMessage && (
                <p className="mt-1 text-xs text-danger">
                  Decision: {r.status} by {r.decidedBy} · reason: {r.reasonMessage} ({r.reasonCode})
                </p>
              )}
              {r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => void decide(r.userId, "approve")} className="rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20">
                    Approve access
                  </button>
                  <button type="button" onClick={() => void decide(r.userId, "reject")} className="rounded-lg border border-danger/40 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10">
                    Reject with reason
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
