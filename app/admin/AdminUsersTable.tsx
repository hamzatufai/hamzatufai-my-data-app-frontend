"use client";

import { useEffect, useState } from "react";
import { authRequest } from "@/lib/auth";

type Row = {
  id: string;
  name: string;
  email: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastSignInAt: string | null;
  requestDate: string | null;
};

const STATUSES = ["", "unverified", "pending", "approved", "rejected", "suspended"];

export default function AdminUsersTable({ onOpenUser }: { onOpenUser: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort: sortKey,
      dir: sortDir,
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });
    const handle = setTimeout(() => {
      authRequest<{ users: Row[]; total: number; pageCount: number }>(
        "GET",
        `/api/admin/users?${query}`,
      )
        .then((r) => {
          setRows(r.users);
          setTotal(r.total);
          setPageCount(r.pageCount);
          setError(null);
        })
        .catch((cause: unknown) =>
          setError(cause instanceof Error ? cause.message : "Could not load users."),
        )
        .finally(() => setBusy(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [search, statusFilter, page, pageSize, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "email" ? "asc" : "desc");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or email…"
          aria-label="Search users"
          className="w-64 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200 focus:border-accent focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          aria-label="Filter by status"
          className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === "" ? "All statuses" : s}</option>
          ))}
        </select>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          aria-label="Rows per page"
          className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200"
        >
          {[25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button
          type="button"
          onClick={() => {
            const query = new URLSearchParams({ format: "csv" });
            window.open(`/api/admin/users?${query}`, "_blank");
          }}
          className="ml-auto rounded-lg border border-line px-3 py-2 text-xs text-slate-400 hover:text-accent"
        >
          Export CSV
        </button>
      </div>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              {[
                ["name", "Name"], ["email", "Email"], ["status", "Status"],
                ["createdAt", "Created"], ["lastSignInAt", "Last sign-in"], ["requestDate", "Request date"],
              ].map(([key, label]) => (
                <th key={key} className="pb-3">
                  <button type="button" onClick={() => toggleSort(key)} className="font-medium hover:text-slate-200">
                    {label} {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
              ))}
              <th className="pb-3 font-medium">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {busy && rows.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">Loading users…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">No users match these filters.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-white/[0.02]">
                  <td className="py-3 font-medium text-slate-200">
                    <button type="button" onClick={() => onOpenUser(row.id)} className="hover:text-accent hover:underline">
                      {row.name}
                    </button>
                  </td>
                  <td className="py-3 text-slate-400">{row.email}</td>
                  <td className="py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="py-3 text-xs text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-xs text-slate-500">{row.lastSignInAt ? new Date(row.lastSignInAt).toLocaleString() : "—"}</td>
                  <td className="py-3 text-xs text-slate-500">{row.requestDate ? new Date(row.requestDate).toLocaleDateString() : "—"}</td>
                  <td className="py-3 text-xs">
                    {row.emailVerified ? <span className="text-accent">✓ verified</span> : <span className="text-slate-600">not verified</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{total.toLocaleString()} users</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-line px-2 py-1 disabled:opacity-40">Prev</button>
          <span>Page {page} of {pageCount}</span>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="rounded-md border border-line px-2 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const className =
    status === "approved" ? "bg-accent/10 text-accent"
    : status === "pending" ? "bg-warning/10 text-warning"
    : status === "rejected" || status === "suspended" ? "bg-danger/10 text-danger"
    : "bg-white/5 text-slate-400";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>{status}</span>;
}
