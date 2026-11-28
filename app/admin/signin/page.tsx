"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authInputClass, authButtonClass } from "@/app/auth/shared";
import { authRequest, storeSessionToken } from "@/lib/auth";

export default function AdminSignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [setupOpen, setSetupOpen] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((r: { setupOpen: boolean; hasAdmin: boolean }) => {
        setHasAdmin(r.hasAdmin);
        setSetupOpen(r.setupOpen);
      })
      .catch(() => { setHasAdmin(true); setSetupOpen(false); });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await authRequest<{ canSignIn?: boolean; role?: string; session?: string }>(
        "POST",
        "/api/auth/signin",
        { email: form.get("email"), password: form.get("password") },
      );
      if (result.canSignIn && result.role === "admin" && result.session) {
        storeSessionToken(result.session);
        router.push("/admin");
        return;
      }
      if (result.canSignIn) {
        setError("This account does not have the administrator role. Regular sign-up users sign in on the user sign-in page.");
        return;
      }
      setError("Email or password is incorrect.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Admin sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-2">
      {hasAdmin === false ? (
        <>
          {setupOpen === false && (
            <p className="mb-3 mx-auto max-w-[640px] rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-xs text-warning">
              SETUP_TOKEN is not configured on this deployment yet. Add it to the <b>backend</b>
              project env in Vercel (Production checked for production domains, Preview checked for preview
              URLs), redeploy the backend, then paste the same value below. Until then the server will
              reject every setup attempt.
            </p>
          )
          }
          <FirstSetupBox />
        <div className="glass mx-auto w-full max-w-xl p-8">
          <h1 className="text-xl font-semibold text-white">First-run admin setup</h1>
          <p className="mt-1 text-xs text-slate-500">
            ADM-01: public admin sign-up exists only during first-run setup and requires the one-time
            setup token set at deployment (SETUP_TOKEN environment variable). After one admin exists,
            this page never shows setup again.
          </p>
          <AdminSetupForm onSuccess={() => router.push("/admin")} />
        </div>
        </>
      ) : (
        <div className="glass mx-auto w-full max-w-md p-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Administrator sign-in</h1>
            <p className="mt-1 text-xs text-slate-500">
              Stricter rules apply: MFA challenge on every sign-in, 30-minute idle timeout, 8-hour
              absolute limit and account lock after five failed attempts. (MFA enrolment is required
              before the first admin session in the enterprise rollout; it is enforced once the
              identity provider is wired.)
            </p>
          </div>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-slate-400">Admin email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className={authInputClass} />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-medium text-slate-400">Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" className={authInputClass} />
            </div>
            {error && <p className="text-sm text-danger" role="alert">{error}</p>}
            <button type="submit" disabled={busy} className={`${authButtonClass} w-full`}>
              {busy ? "Signing in…" : "Sign in as administrator"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            <Link href="/signin" className="hover:text-accent">Regular user sign-in</Link> ·{" "}
            <Link href="/" className="hover:text-accent">Open the CleanCSV platform</Link>
          </p>
        </div>
      )}
    </div>
  );
}

function FirstSetupBox() {
  return (
    <div className="glass mx-auto w-full max-w-xl p-8">
      <h1 className="text-xl font-semibold text-white">First-run admin setup</h1>
      <p className="mt-1 text-xs text-slate-500">
        ADM-01: viable only during first-run setup and requires the one-time setup token set at
        deployment (SETUP_TOKEN on the backend). After one admin exists, setup is closed forever.
      </p>
      <AdminSetupForm onSuccess={() => undefined} />
    </div>
  );
}

import AdminSetupForm from "../AdminSetupForm";
