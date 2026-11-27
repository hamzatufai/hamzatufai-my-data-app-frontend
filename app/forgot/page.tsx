"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/app/auth/AuthShell";
import { authButtonClass, authInputClass } from "@/app/auth/shared";
import { authRequest } from "@/lib/auth";

export default function ForgotPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [token, setToken] = useState("");

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await authRequest<{ devToken?: string }>("POST", "/api/auth/forgot", {
        email: new FormData(event.currentTarget).get("email"),
      });
      setMessage("If this email can be reset, a reset link has been sent.");
      if (result.devToken) {
        setToken(result.devToken);
        setStage("reset");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function applyReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await authRequest("POST", "/api/auth/forgot/reset", {
        token: token || form.get("token"),
        password: form.get("password"),
      });
      setMessage("Password updated. All other sessions were signed out. Redirecting to sign-in…");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={stage === "request" ? "Forgot password" : "Set a new password"}
      subtitle={
        stage === "request"
          ? "Single-use reset link, valid 45 minutes. All sessions are revoked after reset."
          : "Choose a new password (min. 12 characters). Every existing session signs out."
      }
    >
      {stage === "request" ? (
        <form onSubmit={requestLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-slate-400">Account email</label>
            <input id="email" name="email" type="email" required className={authInputClass} />
          </div>
          {message && <p className="text-sm text-accent" role="status">{message}</p>}
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className={`${authButtonClass} w-full`}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <p className="text-center text-xs text-slate-500">
            <Link href="/signin" className="hover:text-accent">Back to sign-in</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={applyReset} className="space-y-4">
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            Dev mode: the reset token is filled automatically because no email provider is configured.
          </p>
          {token && (
            <div>
              <label htmlFor="token" className="text-xs font-medium text-slate-400">Reset token</label>
              <input id="token" name="token" defaultValue={token} required className={authInputClass} />
            </div>
          )}
          <div>
            <label htmlFor="password" className="text-xs font-medium text-slate-400">New password</label>
            <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={authInputClass} placeholder="Min. 12 characters" />
          </div>
          {message && <p className="text-sm text-accent" role="status">{message}</p>}
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className={`${authButtonClass} w-full`}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
