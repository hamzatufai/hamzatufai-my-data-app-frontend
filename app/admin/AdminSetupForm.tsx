"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authInputClass, authButtonClass } from "@/app/auth/shared";
import { authRequest, storeSessionToken } from "@/lib/auth";

export default function AdminSetupForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    if (String(form.get("password")) !== String(form.get("confirm"))) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = await authRequest<{ session?: string }>("POST", "/api/admin/setup", {
        setupToken: form.get("setupToken"),
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      });
      if (result.session) storeSessionToken(result.session);
      router.push("/admin");
      onSuccess();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Admin setup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label htmlFor="setupToken" className="text-xs font-medium text-slate-400">One-time setup token</label>
        <input id="setupToken" name="setupToken" required className={authInputClass} placeholder="Provided at deployment" />
      </div>
      <div>
        <label htmlFor="name" className="text-xs font-medium text-slate-400">Administrator name</label>
        <input id="name" name="name" required minLength={2} className={authInputClass} />
      </div>
      <div>
        <label htmlFor="email" className="text-xs font-medium text-slate-400">Admin email</label>
        <input id="email" name="email" type="email" required className={authInputClass} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="text-xs font-medium text-slate-400">Password</label>
          <input id="password" name="password" type="password" required minLength={12} className={authInputClass} placeholder="Min. 12 characters" />
        </div>
        <div>
          <label htmlFor="confirm" className="text-xs font-medium text-slate-400">Confirm</label>
          <input id="confirm" name="confirm" type="password" required className={authInputClass} />
        </div>
      </div>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className={`${authButtonClass} w-full`}>
        {busy ? "Creating administrator…" : "Create administrator"}
      </button>
    </form>
  );
}
