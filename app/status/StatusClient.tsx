"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthShell from "@/app/auth/AuthShell";
import { authButtonClass, authInputClass } from "@/app/auth/shared";
import { authRequest } from "@/lib/auth";

const DEV_TOKEN_KEY = "cleancsv:dev-verify-token";

export default function StatusClient() {
  const router = useRouter();
  const params = useSearchParams();
  const state = params.get("state") ?? "pending";
  const email = params.get("email") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Store the dev-mode verification token so the "verify now" button works
  // without an email provider in local development.
  useEffect(() => {
    const devToken = params.get("devToken");
    if (devToken) {
      try { window.localStorage.setItem(DEV_TOKEN_KEY, devToken); } catch { /* ignore */ }
    }
  }, [params]);

  async function resendVerification() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await authRequest<{ message: string; devToken?: string }>(
        "POST",
        "/api/auth/verify",
        { email },
      );
      setMessage(result.message);
      if (result.devToken) {
        try { window.localStorage.setItem(DEV_TOKEN_KEY, result.devToken); } catch { /* ignore */ }
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not resend the verification email.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyWithDevToken() {
    setBusy(true);
    try {
      const devToken = window.localStorage.getItem(DEV_TOKEN_KEY) ?? "";
      await authRequest("GET", `/api/auth/verify?token=${encodeURIComponent(devToken)}`);
      window.localStorage.removeItem(DEV_TOKEN_KEY);
      router.push("/signin?verified=1");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  const accessing = state === "verify" || state === "unverified";

  return (
    <AuthShell
      title={
        state === "verify" ? "Verify your email"
        : state === "unverified" ? "Email not verified"
        : state === "pending" ? "Access request pending"
        : "Account status"
      }
    >
      <div className="space-y-4 text-sm text-slate-400">
        {(state === "verify" || state === "unverified") && (
          <>
            <p>
              We sent a single-use verification link to{" "}
              <span className="text-slate-200">{email || "your email"}</span>. It expires after 24
              hours. Verifying is required before your access request can be submitted.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={resendVerification} disabled={busy || !email} className={authButtonClass}>
                Resend verification
              </button>
              {/* Dev-only link consumer: shown ONLY when explicitly enabled via
                  NEXT_PUBLIC_SHOW_DEV_VERIFY=true (local testing without a mail
                  server). It is never rendered in production builds. */}
              {process.env.NEXT_PUBLIC_SHOW_DEV_VERIFY === "true" && (
                <button type="button" onClick={verifyWithDevToken} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm text-slate-300 hover:border-accent/40">
                  Verify now (dev)
                </button>
              )}
            </div>
            {process.env.NEXT_PUBLIC_SHOW_DEV_VERIFY !== "true" && (
              <p className="text-xs text-slate-600">
                The verification link arrives at the inbox of the exact address you registered.
                Nobody can verify your account from any other mailbox.
              </p>
            )}
          </>
        )}

        {state === "pending" && (
          <>
            <p>Your request is in the admin queue. You will receive an email when it is reviewed.</p>
            <Link href="/signin" className="text-xs text-accent hover:underline">Return to sign-in</Link>
          </>
        )}

        {message && <p className="text-xs text-accent" role="status">{message}</p>}
      </div>
    </AuthShell>
  );
}
