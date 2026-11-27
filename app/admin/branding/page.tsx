"use client";

import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import { authRequest } from "@/lib/auth";

type Version = { id: string; name: string; hasLogo: boolean; changedBy: string; changedAt: string };

export default function AdminBrandingPage() {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [hasLogo, setHasLogo] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    authRequest<{ current: { platformName: string; hasLogo: boolean; versions?: never }; versions: Version[] }>(
      "GET",
      "/api/admin/branding",
    )
      .then((r) => {
        setName(r.current.platformName);
        setSavedName(r.current.platformName);
        setHasLogo(r.current.hasLogo);
        setVersions(r.versions);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load branding."));
    fetch("/api/branding").then((r) => r.json()).then((r: { platformName?: string }) => {
      if (r.platformName) setPreviewName(null);
    }).catch(() => undefined);
  }

  useEffect(load, []);

  async function publish(body: Record<string, unknown>, description: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await authRequest("PUT", "/api/branding", body);
      setMessage(`${description} applied platform-wide.`);
      setPreviewName(null);
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Branding update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogoChosen(file: File) {
    // Client-side size guard; content is verified server-side by signature.
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be at most 2 MB.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    await publish({ logoDataUrl: dataUrl }, "New logo");
  }

  async function rollback(versionId: string) {
    if (!window.confirm("Roll back branding to this version? This change is platform-wide and logged.")) return;
    setBusy(true);
    try {
      await authRequest("POST", "/api/admin/branding", { brandVersionId: versionId });
      setMessage("Branding rolled back.");
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Rollback failed.");
    } finally {
      setBusy(false);
    }
  }

  const nameDirty = name !== savedName && name.trim().length >= 2 && name.trim().length <= 60;

  return (
    <AdminShell title="Platform name & logo" subtitle="Changes apply to every user — header, sign-in and sign-up pages.">
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      {message && <p className="text-accent" role="status">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform name (BRD-01)</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            aria-label="Platform name"
            className="mt-3 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200"
          />
          {previewName && <ShopWindow name={previewName} />}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={busy || !nameDirty}
              onClick={() => publish({ platformName: name.trim() }, `Name "${name.trim()}"`)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-base disabled:opacity-40"
            >
              Publish name
            </button>
            <button type="button" onClick={() => { setName(savedName); setPreviewName(null); }} className="rounded-lg border border-line px-3 py-2 text-xs text-slate-400">
              Discard
            </button>
          </div>
        </section>

        <section className="glass p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Logo (BRD-02)</h2>
          <p className="mt-2 text-xs text-slate-500">PNG, JPG, WebP or SVG. Max 2 MB. SVGs are sanitised (scripts and external refs removed). File type is checked by content, not extension.</p>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onLogoChosen(f); }}
            aria-label="Choose logo file"
            className="mt-3 text-xs text-slate-400"
          />
          <p className="mt-2 text-xs text-slate-500">Current logo: {hasLogo ? "custom logo published" : "default"}</p>
          {hasLogo && (
            <button type="button" disabled={busy} onClick={() => publish({ resetLogo: true }, "Logo reset")} className="mt-2 rounded-lg border border-danger/40 px-3 py-2 text-xs text-danger hover:bg-danger/10">
              Reset to default logo
            </button>
          )}
        </section>
      </div>

      <section className="glass mt-6 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Branding history — last 5 versions (BRD-04)</h2>
        {versions.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600">No changes yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line text-xs">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate-300">
                  “{v.name}” {v.hasLogo ? "· custom logo" : "· default logo"} — by {v.changedBy} at {new Date(v.changedAt).toLocaleString()}
                </span>
                <button type="button" disabled={busy} onClick={() => void rollback(v.id)} className="rounded-lg border border-line px-3 py-1.5 text-slate-400 hover:text-accent">
                  Roll back
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

function ShopWindow({ name }: { name: string }) {
  return (
    <p className="mt-3 rounded-lg border border-line p-3 text-xs text-slate-500">
      Preview in header and sign-in pages: <span className="font-semibold text-white">{name}</span> (header and sign-in read the live branding API on publish)
    </p>
  );
}
