"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthShell from "@/app/auth/AuthShell";
import { authButtonClass } from "@/app/auth/shared";
import { authRequest } from "@/lib/auth";

type VerifyResult = { message: string; status?: string };

/**
 * Gmail link lands here: /verify-email?token=….
 * The single-use token is consumed, then the user is pointed at the sign-in
 * page; after an approved sign-in they land on the dashboard.
 */
export default function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"working" | "ok" | "error">(token ? "working" : "error");
  const [message, setMessage] = useState<string | null>(token ? null : "This verification link is missing its token.");

  useEffect(() => {
    if (!token) return;
    authRequest<VerifyResult>("GET", `/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((result) => {
        setState("ok");
        setMessage(result.message || "Email verified. Your access request is the next step.");
      })
      .catch((cause: unknown) => {
        setState("error");
        setMessage(cause instanceof Error ? cause.message : "Verification failed.");
      });
  }, [token]);

  return (
    <AuthShell
      title={state === "ok" ? "Email verified ✓" : state === "working" ? "Verifying your email…" : "Verification problem"}
      subtitle={
        state === "ok"
          ? "Next: sign in to submit your access request. After the admin approves you, the dashboard opens."
          : undefined
      }
    >
      <div className="space-y-4 text-sm text-slate-400">
        {state === "working" && !message && <p className="text-slate-500">Checking your verification link…</p>}
        {message && (
          <p className={state === "error" ? "text-danger" : "text-accent"} role={state === "error" ? "alert" : "status"}>
            {message}
          </p>
        )}
        {state === "ok" && (
          <Link href="/signin" className={`${authButtonClass} w-full`}>
            Continue to sign in
          </Link>
        )}
        {state === "error" && (
          <Link href="/status?state=verify" className="text-xs text-accent hover:underline">
            Request a new verification link
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
