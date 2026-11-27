"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "@/app/auth/AuthShell";
import { authInputClass, authButtonClass } from "@/app/auth/shared";
import { authRequest } from "@/lib/auth";

type SignUpResult = { message: string; devToken?: string };

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = await authRequest<SignUpResult>("POST", "/api/auth/signup", {
        name: form.get("name"),
        email: form.get("email"),
        password,
        acceptTerms: form.get("terms") === "on",
      });
      const params = new URLSearchParams({ state: "verify", email: String(form.get("email") ?? "") });
      // Dev-only token handed directly to the verification step (no mail server locally).
      if (result.devToken) params.set("devToken", result.devToken);
      router.push(`/status?${params}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-up failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Verification and admin approval come after sign-up.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="text-xs font-medium text-slate-400">Full name</label>
          <input id="name" name="name" required minLength={2} maxLength={80} className={authInputClass} placeholder="Jane Analyst" />
        </div>
        <div>
          <label htmlFor="email" className="text-xs font-medium text-slate-400">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={authInputClass} placeholder="you@company.com" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="text-xs font-medium text-slate-400">Password</label>
            <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={authInputClass} placeholder="Min. 12 characters" />
          </div>
          <div>
            <label htmlFor="confirm" className="text-xs font-medium text-slate-400">Confirm password</label>
            <input id="confirm" name="confirm" type="password" required autoComplete="new-password" className={authInputClass} />
          </div>
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-400">
          <input type="checkbox" name="terms" required className="mt-0.5 accent-[#2ee6a6]" />
          I accept the terms of use and the privacy notice.
        </label>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className={`${authButtonClass} w-full`}>
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="text-center text-xs text-slate-500">
          Already have an account? <Link href="/signin" className="text-accent hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
