"use client";

import { authInputClass, authButtonClass } from "@/app/auth/shared";

export default function AccessForm({
  devToken,
  busy,
  error,
  onSubmit,
}: {
  devToken: string;
  busy: boolean;
  error: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {devToken && (
        <p className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
          Dev session token detected. The account password has already been verified.
        </p>
      )}
      <div>
        <label htmlFor="fullName" className="text-xs font-medium text-slate-400">Full name</label>
        <input id="fullName" name="fullName" required minLength={2} className={authInputClass} />
      </div>
      <div>
        <label htmlFor="organisation" className="text-xs font-medium text-slate-400">Organisation (optional)</label>
        <input id="organisation" name="organisation" className={authInputClass} />
      </div>
      <div>
        <label htmlFor="jobRole" className="text-xs font-medium text-slate-400">Job role</label>
        <input id="jobRole" name="jobRole" required minLength={2} className={authInputClass} placeholder="Business analyst" />
      </div>
      <div>
        <label htmlFor="intendedUse" className="text-xs font-medium text-slate-400">Intended use</label>
        <textarea
          id="intendedUse"
          name="intendedUse"
          required
          minLength={20}
          rows={4}
          className={authInputClass}
          placeholder="Describe how you will use CleanCSV (at least 20 characters)"
        />
      </div>
      <div>
        <label htmlFor="dataTypes" className="text-xs font-medium text-slate-400">Expected data types (optional)</label>
        <input id="dataTypes" name="dataTypes" className={authInputClass} placeholder="Sales transactions, customer records…" />
      </div>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className={`${authButtonClass} w-full`}>
        {busy ? "Submitting…" : "Submit access request"}
      </button>
    </form>
  );
}
