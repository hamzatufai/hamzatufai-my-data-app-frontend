"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/app/auth/AuthShell";
import { authButtonClass, authInputClass } from "@/app/auth/shared";
import { authRequest, fetchSession, type SessionInfo } from "@/lib/auth";

type Created = { message: string; status: string };

export default function AccessRequestClient() {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSession().then((info) => {
      setSession(info);
      setChecked(true);
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await authRequest("POST", "/api/access/request", {
        fullName: form.get("fullName"),
        organisation: form.get("organisation"),
        jobRole: form.get("jobRole"),
        intendedUse: form.get("intendedUse"),
        dataTypes: form.get("dataTypes"),
      });
      router.push("/status?state=pending");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Request platform access"
      subtitle="Tell the administrator who you are and how the platform will be used."
    >
      {!checked ? (
        <p className="text-sm text-slate-500">Checking sign-in…</p>
      ) : !session?.authenticated ? (
        <div className="space-y-3 text-sm text-slate-400">
          <p>Sign in with your new account to submit the access request.</p>
          <Link href="/signin" className="text-accent hover:underline">Go to sign-in</Link>
        </div>
      ) : session.status === "unverified" ? (
        <div className="space-y-3 text-sm text-slate-400">
          <p>Verify your email first, then come back here.</p>
          <Link href="/status?state=unverified" className="text-accent hover:underline">Open verification status</Link>
        </div>
      ) : session.status === "pending" ? (
        <div className="space-y-3 text-sm text-slate-400">
          <p>Your access request is already in the admin queue.</p>
          <Link href="/status?state=pending" className="text-accent hover:underline">View request status</Link>
        </div>
      ) : session.status === "approved" ? (
        <div className="space-y-3 text-sm text-slate-400">
          <p>You already have platform access.</p>
          <Link href="/" className="text-accent hover:underline">Open your dashboard</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
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
            <textarea id="intendedUse" name="intendedUse" required minLength={20} rows={4} className={authInputClass} placeholder="How will you use CleanCSV? (at least 20 characters)" />
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
      )}
    </AuthShell>
  );
}
