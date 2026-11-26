"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import Card from "@/components/Card";
import { removeProfile, saveProfile, type DatasetProfile } from "@/lib/profiles";
import { useProfiles } from "@/lib/useProfiles";

type WorkerReply =
  | { ok: true; profile: Omit<DatasetProfile, "id" | "importedAt"> }
  | { ok: false; error: string };

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export default function ImportPage() {
  const profiles = useProfiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setMessage(null);

    if (selected && !selected.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Choose a .csv file. Other formats are not supported yet.");
      event.target.value = "";
      return;
    }
    if (selected && selected.size > MAX_FILE_BYTES) {
      setFile(null);
      setError("This CSV is larger than 25 MB. Split it into smaller files and try again.");
      event.target.value = "";
      return;
    }

    setFile(selected);
  }

  function importFile() {
    if (!file || processing) return;
    setProcessing(true);
    setError(null);
    setMessage(null);

    let worker: Worker;
    try {
      worker = new Worker(new URL("../../workers/csvProfile.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      setProcessing(false);
      setError("Could not start the CSV profiler in this browser.");
      return;
    }

    const timeout = window.setTimeout(() => {
      worker.terminate();
      setProcessing(false);
      setError("CSV profiling took too long and was stopped. Try a smaller file.");
    }, 120_000);

    const finishWorker = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      setProcessing(false);
    };

    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      finishWorker();
      if (!event.data.ok) {
        setError(event.data.error);
        return;
      }

      try {
        saveProfile({
          ...event.data.profile,
          id: crypto.randomUUID(),
          importedAt: new Date().toISOString(),
        });
        setMessage(`Profiled ${event.data.profile.name}. Its summary is now on the dashboard.`);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch {
        setError("The profile was calculated but could not be saved in this browser.");
      }
    };

    worker.onerror = () => {
      finishWorker();
      setError("The CSV profiler stopped unexpectedly. Try a smaller or simpler CSV.");
    };

    try {
      worker.postMessage(file);
    } catch {
      finishWorker();
      setError("The CSV could not be sent to the profiler. Choose the file again and retry.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="glass flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Import Data</h1>
          <p className="mt-1 text-sm text-slate-400">Profile a CSV privately in this browser.</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </header>

      <Card title="CSV profile" className="max-w-3xl">
        <p className="mb-4 text-sm text-slate-400">
          The file is parsed in a browser worker. Only its filename and aggregate profile are saved
          in this browser; file rows are not sent to the API or stored.
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-white/[0.02] px-5 py-10 text-center transition hover:border-accent/40">
          <FileSpreadsheet className="h-8 w-8 text-accent" />
          <span className="font-medium text-white">{file ? file.name : "Choose a CSV file"}</span>
          <span className="text-xs text-slate-500">Maximum 25 MB · up to 250,000 data rows</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Choose CSV file"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={importFile}
            disabled={!file || processing}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-base transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload className="h-4 w-4" />
            {processing ? "Profiling CSV…" : "Profile CSV"}
          </button>
          {message && <p className="text-sm text-accent" role="status">{message}</p>}
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        </div>
      </Card>

      <Card title={`Saved profiles (${profiles.length})`} className="max-w-3xl">
        {profiles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-slate-500">
            No CSV profiles saved in this browser yet.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {[...profiles].reverse().map((profile) => (
              <li key={profile.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{profile.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {profile.rows.toLocaleString()} rows · {profile.columns.length} columns · Quality {profile.quality}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProfile(profile.id)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-danger"
                  aria-label={`Remove profile for ${profile.name}`}
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
