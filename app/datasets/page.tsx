"use client";

import Link from "next/link";
import { Trash2, Database, FileText, Download, Upload } from "lucide-react";
import Card, { EmptyState } from "@/components/Card";
import TopBar from "@/components/TopBar";
import ApiStatus from "@/components/ApiStatus";
import { removeProfile, type DatasetProfile } from "@/lib/profiles";
import { useProfiles } from "@/lib/useProfiles";

const fmt = (n: number) => n.toLocaleString("en-US");

function qualityClass(quality: number): string {
  if (quality >= 80) return "text-accent";
  if (quality >= 60) return "text-warning";
  return "text-danger";
}

export default function DatasetsPage() {
  const profiles = useProfiles();

  const totalRows = profiles.reduce((sum, p) => sum + p.rows, 0);
  const totalIssues = profiles.reduce(
    (sum, p) => sum + p.missingCells + p.duplicateRows,
    0,
  );

  return (
    <div className="space-y-6">
      <TopBar title="My Datasets" alerts={totalIssues} />
      <ApiStatus />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Datasets</p>
          <p className="mt-2 text-2xl font-semibold text-white">{profiles.length}</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Rows inspected</p>
          <p className="mt-2 text-2xl font-semibold text-white">{fmt(totalRows)}</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Missing cells</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {fmt(profiles.reduce((sum, p) => sum + p.missingCells, 0))}
          </p>
        </div>
        <div className="glass p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Duplicate rows</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {fmt(profiles.reduce((sum, p) => sum + p.duplicateRows, 0))}
          </p>
        </div>
      </div>

      <Card title="Datasets profiled in this browser">
        {profiles.length === 0 ? (
          <div className="space-y-4">
            <EmptyState text="No datasets yet. Import a CSV to create your first profile — the file stays on your device; only the summary is saved." />
            <div className="flex justify-center">
              <Link
                href="/import"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-base transition hover:bg-accent/90"
              >
                <Upload className="h-4 w-4" /> Import a CSV
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {[...profiles].reverse().map((profile: DatasetProfile) => (
              <li
                key={profile.id}
                className="flex flex-wrap items-center gap-4 py-4 first:pt-0"
              >
                <span className="rounded-lg bg-accent/10 p-2.5 text-accent">
                  <Database className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{profile.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {fmt(profile.rows)} rows · {profile.columns.length} columns ·{" "}
                    {profile.duplicateRows.toLocaleString()} duplicates ·{" "}
                    {new Date(profile.importedAt).toLocaleString()}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${qualityClass(profile.quality)}`}>
                  {profile.quality}%
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profiling?dataset=${encodeURIComponent(profile.id)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                    title="View profile"
                  >
                    <FileText className="h-4 w-4" /> Profile
                  </Link>
                  <Link
                    href={`/export?dataset=${encodeURIComponent(profile.id)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-accent"
                    title="Export"
                  >
                    <Download className="h-4 w-4" /> Export
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeProfile(profile.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-danger"
                    aria-label={`Delete ${profile.name}`}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
