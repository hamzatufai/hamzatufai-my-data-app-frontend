"use client";

import { useState } from "react";

export type UserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    lastSignInAt: string | null;
    requestSubmittedAt: string | null;
  };
  statusTimeline: { status: string; at: string; by: string; reason?: string }[];
  accessRequests: {
    id: string;
    fullName: string;
    organisation: string;
    jobRole: string;
    intendedUse: string;
    status: string;
    reasonMessage?: string;
    decidedBy?: string;
    decidedAt?: string;
    createdAt: string;
  }[];
  audit: { id: string; action: string; details: string; timestamp: string }[];
};

type Props = {
  detail: UserDetail | null;
  busy: boolean;
  onClose: () => void;
  onAction: (userId: string, action: string, reason?: string) => Promise<void>;
};

const ACTIONS = [
  { id: "approve", label: "Approve", needsReason: false, danger: false },
  { id: "reject", label: "Reject", needsReason: true, danger: true },
  { id: "suspend", label: "Suspend", needsReason: true, danger: true },
  { id: "reactivate", label: "Reactivate", needsReason: false, danger: false },
  { id: "delete", label: "Delete (soft)", needsReason: false, danger: true },
];

export default function UserDetailDrawer({ detail, busy, onClose, onAction }: Props) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (!detail) {
    return (
      <div className="fixed inset-y-4 right-4 z-50 w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-panel p-6 shadow-card">
        <p className="text-sm text-slate-500">{busy ? "Loading user…" : "No user selected."}</p>
        <button type="button" onClick={onClose} className="mt-4 text-xs text-slate-400 hover:text-white">Close</button>
      </div>
    );
  }

  const chosen = ACTIONS.find((a) => a.id === pendingAction);

  const userId = detail?.user.id ?? "";
  async function confirmAction() {
    if (!chosen || !confirming || !userId) return;
    await onAction(userId, chosen.id, reason);
    setPendingAction(null);
    setReason("");
    setConfirming(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`User detail: ${detail.user.name}`}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 h-full w-full max-w-lg overflow-y-auto border-l border-line bg-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{detail.user.name}</h2>
            <p className="text-sm text-slate-400">{detail.user.email}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close user detail" className="text-slate-500 hover:text-white">✕</button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2 text-xs">
          <div className="glass p-3"><dt className="text-slate-500">Status</dt><dd className="mt-1 font-medium text-slate-200">{detail.user.status}</dd></div>
          <div className="glass p-3"><dt className="text-slate-500">Email verified</dt><dd className="mt-1 font-medium text-slate-200">{detail.user.emailVerified ? "Yes" : "No"}</dd></div>
          <div className="glass p-3"><dt className="text-slate-500">Created</dt><dd className="mt-1 text-slate-200">{new Date(detail.user.createdAt).toLocaleString()}</dd></div>
          <div className="glass p-3"><dt className="text-slate-500">Last sign-in</dt><dd className="mt-1 text-slate-200">{detail.user.lastSignInAt ? new Date(detail.user.lastSignInAt).toLocaleString() : "Never"}</dd></div>
        </dl>

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Status timeline</h3>
        <ul className="mt-2 space-y-1 border-l border-line pl-4 text-xs text-slate-400">
          {detail.statusTimeline.map((step, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-accent/60" aria-hidden />
              <span className="text-slate-200">{step.status}</span> — {new Date(step.at).toLocaleString()}
              {step.by && <span className="text-slate-600"> · by {step.by}</span>}
              {step.reason && <span className="block text-slate-600">Reason: {step.reason}</span>}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Access request</h3>
        {detail.accessRequests.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600">No request submitted yet.</p>
        ) : (
          detail.accessRequests.map((r) => (
            <div key={r.id} className="glass mt-2 p-3 text-xs">
              <p className="text-slate-300">{r.jobRole} {r.organisation ? `— ${r.organisation}` : ""}</p>
              <p className="mt-1 text-slate-400">“{r.intendedUse}”</p>
              <p className="mt-1 text-slate-600">
                Status: {r.status}
                {r.decidedBy && ` · decided by ${r.decidedBy} at ${new Date(r.decidedAt ?? "").toLocaleString()}`}
                {r.reasonMessage && ` · reason: ${r.reasonMessage}`}
              </p>
            </div>
          ))
        )}

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Admin actions</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIONS.filter((a) => a.id !== detail.user.status).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => { setPendingAction(a.id); setConfirming(false); }}
              className={`rounded-lg px-3 py-2 text-xs ${
                a.danger ? "border border-danger/40 text-danger hover:bg-danger/10" : "bg-accent/10 text-accent hover:bg-accent/20"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {pendingAction && (
          <div className="glass mt-3 p-4">
            <p className="text-sm text-slate-200">
              {chosen?.danger ? "This action is destructive and logged. Confirm to continue." : `Confirm ${pendingAction}.`}
            </p>
            {chosen?.needsReason && (
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required)"
                aria-label="Reason"
                className="mt-2 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200"
              />
            )}
            <div className="mt-3 flex gap-2">
              {!confirming ? (
                <button
                  type="button"
                  onClick={() => chosen?.needsReason && reason.length < 4 ? null : setConfirming(true)}
                  className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-base disabled:opacity-40"
                  disabled={chosen?.needsReason && reason.length < 4}
                >
                  Confirm
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void confirmAction()}
                  className="rounded-lg bg-danger px-3 py-2 text-xs font-semibold text-base"
                >
                  {chosen?.danger ? "Yes, apply now" : "Apply"}
                </button>
              )}
              <button type="button" onClick={() => { setPendingAction(null); setConfirming(false); }} className="rounded-lg border border-line px-3 py-2 text-xs text-slate-400">
                Cancel
              </button>
            </div>
          </div>
        )}

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Audit entries</h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-500">
          {detail.audit.slice(0, 10).map((entry) => (
            <li key={entry.id}>
              <span className="text-slate-300">{entry.action}</span> — {entry.details} · {new Date(entry.timestamp).toLocaleString()}
            </li>
          ))}
          {detail.audit.length === 0 && <li>No audit entries for this user.</li>}
        </ul>
      </aside>
    </div>
  );
}
