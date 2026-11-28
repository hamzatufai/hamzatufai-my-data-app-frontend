"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

function ConnectionTest() {
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [detail, setDetail] = useState<string | null>(null);

  async function runTest() {
    setStatus("testing");
    setDetail(null);
    try {
      const health = await apiGet<{ status: string }>("/health", { retries: 2, timeoutMs: 15000 });
      if (health.status === "ok") {
        setStatus("ok");
        setDetail("GET /api/health OK — backend reachable.");
      } else {
        setStatus("fail");
        setDetail(`Unexpected health response: ${JSON.stringify(health)}`);
      }
    } catch (cause) {
      setStatus("fail");
      setDetail(cause instanceof Error ? cause.message : "Network request failed");
    }
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Connection diagnostics</p>
          <p className="mt-1 text-xs text-slate-500">
            Tests GET /api/health through the exact request path the app uses (same-origin proxy
            first, then the configured backend base).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runTest()}
          disabled={status === "testing"}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-base disabled:opacity-40"
        >
          {status === "testing" ? "Testing…" : "Run test"}
        </button>
      </div>
      {detail && (
        <p className={`mt-3 text-xs ${status === "ok" ? "text-accent" : "text-danger"}`} role="status">
          {detail}
        </p>
      )}
    </div>
  );
}
import { Save, Trash2 } from "lucide-react";
import Card from "@/components/Card";
import TopBar from "@/components/TopBar";
import ApiStatus from "@/components/ApiStatus";
import { clearStaleCache, getApiBase, getApiBaseOverride, setApiBaseOverride } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";
import { removeProfile, type DatasetProfile } from "@/lib/profiles";
import { useProfiles } from "@/lib/useProfiles";

type SaveState = "idle" | "saved" | "cleared";

export default function SettingsPage() {
  const profiles = useProfiles();
  const [apiValue, setApiValue] = useState("");
  const [effectiveBase, setEffectiveBase] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    setApiValue(getApiBaseOverride());
    setEffectiveBase(getApiBase());
  }, []);

  const totalRows = profiles.reduce((sum, p) => sum + p.rows, 0);

  const saveApiUrl = () => {
    const previous = getApiBaseOverride();
    setApiBaseOverride(apiValue);
    clearStaleCache();
    setEffectiveBase(getApiBase());
    if (previous !== (apiValue ? apiValue.trim() : "")) {
      // Reload so all live components (API status, stats) reconnect using the
      // new base URL instead of holding connections to the old one.
      window.location.reload();
      return;
    }
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 4000);
  };

  const clearWorkspace = () => {
    if (!window.confirm("Delete all locally stored dataset profiles from this browser? This cannot be undone.")) return;
    profiles.forEach((profile: DatasetProfile) => removeProfile(profile.id));
    setSaveState("cleared");
    window.setTimeout(() => setSaveState("idle"), 4000);
  };

  return (
    <div className="space-y-6">
      <TopBar title="Settings" alerts={profiles.length} />
      <ApiStatus />

      <Card title="Connection">
        <div className="space-y-4">
          <div>
            <label htmlFor="api-url" className="text-sm font-medium text-slate-200">
              Backend API URL override
            </label>
            <p className="mt-1 text-xs text-slate-500">
              The deployed backend base URL (e.g. https://your-backend.vercel.app). Leave empty to
              use the value baked in at build time (NEXT_PUBLIC_API_URL) or same-origin /api. Set
              this if your frontend was deployed before the backend URL was configured.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                id="api-url"
                type="url"
                inputMode="url"
                placeholder="https://your-backend.vercel.app"
                value={apiValue}
                onChange={(event) => setApiValue(event.target.value)}
                className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={saveApiUrl}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-base transition hover:bg-accent/90"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Resolved API base: <code className="text-slate-400">{effectiveBase || "(same-origin /api)"}</code>
            </p>
            {saveState === "saved" && (
              <p className="mt-2 text-xs text-accent" role="status">
                Saved. Reloading the API health check…
              </p>
            )}
          </div>
          <ConnectionTest />
        </div>
      </Card>

      <Card title="Data & privacy">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Uploaded files are processed entirely in this browser. Only dataset summaries (column
            names, counts, quality metrics) are stored locally — never the file contents. No raw
            rows are sent to any server by these features.
          </p>
          <p className="text-sm text-slate-400" aria-live="polite">
            Currently stored: {profiles.length} profile{profiles.length === 1 ? "" : "s"} covering{" "}
            {totalRows.toLocaleString()} rows.{" "}
            {DEMO_MODE ? "Demo sample data mode is ON at build time." : "Demo sample data is off."}
          </p>
          {saveState === "cleared" && <p className="text-xs text-accent" role="status">Workspace cleared.</p>}
          <button
            type="button"
            onClick={clearWorkspace}
            className="inline-flex items-center gap-2 rounded-lg border border-danger/40 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" /> Clear workspace data
          </button>
        </div>
      </Card>

      <Card title="About">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Product</dt>
            <dd className="text-slate-200">CleanCSV — enterprise data quality platform</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Processing</dt>
            <dd className="text-slate-200">Local-first (browser) · workers · no dataset upload</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Formats</dt>
            <dd className="text-slate-200">CSV (25 MB / 250k rows tested limit in current build)</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Quality score</dt>
            <dd className="text-slate-200">Completeness &amp; uniqueness proxies — not a universal standard</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
