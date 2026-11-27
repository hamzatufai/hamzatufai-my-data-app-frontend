"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "@/app/auth/AuthShell";
import { authInputClass, authButtonClass } from "@/app/auth/shared";
import { authRequest, storeSessionToken } from "@/lib/auth";

type SignInResult = {
  message: string;
  status?: string;
  canSignIn?: boolean;
  role?: string;
  session?: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await authRequest<SignInResult>("POST", "/api/auth/signin", {
        email: form.get("email"),
        password: form.get("password"),
      });
      if (result.canSignIn && result.session) {
        storeSessionToken(result.session);
        router.push(result.role === "admin" ? "/admin" : "/");
        return;
      }
      // AUTH-04 + AUTH-08: unverified/pending sign-ins get a RESTRICTED
      // session (account page + access request only; platform APIs still
      // reject it server-side).
      if (result.status === "unverified" || result.status === "pending") {
        if (result.session) storeSessionToken(result.session);
      }
      if (result.status === "unverified") {
        router.push(`/status?state=unverified&email=${encodeURIComponent(String(form.get("email")))}`);
      } else if (result.status === "pending") {
        // Verified, awaiting approval: go straight to the access request form —
        // if submitted already the page links to the status view instead.
        router.push("/access-request");
      } else {
        setError(result.message);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Approved accounts only — platform access requires admin approval.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-xs font-medium text-slate-400">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={authInputClass} />
        </div>
        <div>
          <label htmlFor="password" className="text-xs font-medium text-slate-400">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••••••" className={authInputClass} />
        </div>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className={`${authButtonClass} w-full`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex justify-between text-xs text-slate-500">
          <Link href="/signup" className="hover:text-accent">Need an account? Sign up</Link>
          <Link href="/forgot" className="hover:text-accent">Forgot password?</Link>
        </div>
      </form>
    </AuthShell>
  );
}
