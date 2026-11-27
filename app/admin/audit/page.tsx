"use client";

import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import { authRequest } from "@/lib/auth";

type AuditEntry = {
  id: string;
  adminId: string | null;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string;
  timestamp: string;
};

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [actionPrefix, setActionPrefix] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams({ ...(actionPrefix ? { action: actionPrefix } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) });
    authRequest<{ events: AuditEntry[] }>("GET", `/api/admin/audit?${query}`)
      .then((r) => setEntries(r.events))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load audit log."));
  }, [actionPrefix, from, to]);

  return (
    <AdminShell title="Admin audit log" subtitle="Read-only. Entries cannot be edited or deleted by anyone.">
      <div className="mb-4 flex flex-wrap gap-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200" />
        <select value={actionPrefix} onChange={(e) => setActionPrefix(e.target.value)} aria-label="Action filter" className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200">
          <option value="">All action types</option>
          {["admin.", "user.", "branding.", "access.", "auth."].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="pb-3 font-medium">Time</th><th className="pb-3 font-medium">Actor</th><th className="pb-3 font-medium">Action</th><th className="pb-3 font-medium">Details</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="py-2.5 text-xs text-slate-500">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="py-2.5 text-xs text-slate-400">{e.adminEmail ?? "system"}</td>
                <td className="py-2.5 text-xs"><span className="rounded bg-white/5 px-2 py-0.5 text-slate-300">{e.action}</span></td>
                <td className="py-2.5 text-xs text-slate-400">{e.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length === 0 && !error && <p className="py-10 text-center text-sm text-slate-500">No audit entries match these filters.</p>}
    </AdminShell>
  );
}
