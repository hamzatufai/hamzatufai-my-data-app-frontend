"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileJson, FileText, Upload } from "lucide-react";
import Link from "next/link";
import Card, { EmptyState } from "@/components/Card";
import TopBar from "@/components/TopBar";
import ApiStatus from "@/components/ApiStatus";
import DatasetPicker from "@/components/DatasetPicker";
import type { DatasetProfile } from "@/lib/profiles";
import { useProfiles } from "@/lib/useProfiles";

function downloadFile(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function ExportClient() {
  const profiles = useProfiles();
  const [selectedId, setSelectedId] = useState<string | null>(profiles.at(-1)?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);


  const profile = useMemo(
    () => profiles.find((p) => p.id === (selectedId ?? profiles.at(-1)?.id)),
    [profiles, selectedId],
  );
  const exportProfileSummary = (current: DatasetProfile) => {
    const lines = [
      ["column", "inferred_type", "null_pct", "quality"].join(","),
      ...current.columns.map((column) =>
        [column.name, column.type, column.nullPct.toFixed(2), column.quality]
          .map(csvEscape)
          .join(","),
      ),
    ];
    downloadFile(`${current.name}-profile.csv`, "text/csv", lines.join("\n"));
    setMessage(`Exported profile summary for ${current.name} as CSV.`);
  };

  const exportQualityReport = (current: DatasetProfile) => {
    const report = [
      `CleanCSV Data Quality Report`,
      `Generated: ${new Date().toISOString()}`,
      `File: ${current.name}`,
      `Imported: ${current.importedAt}`,
      ``,
      `Rows: ${current.rows.toLocaleString()}`,
      `Columns: ${current.columns.length}`,
      `Missing cells: ${current.missingCells.toLocaleString()}`,
      `Duplicate rows: ${current.duplicateRows.toLocaleString()}`,
      `Quality score: ${current.quality}% (formula: completeness and uniqueness proxies; not a universal standard)`,
      ``,
      `Column details:`,
      ...current.columns.map(
        (column) =>
          `  ${column.name} — ${column.type}, ${column.nullPct.toFixed(1)}% nulls, quality ${column.quality}`,
      ),
      ``,
      `Notes: computed locally in the browser. The source file never left this device.`,
    ].join("\n");
    downloadFile(`${current.name}-quality-report.txt`, "text/plain", report);
    setMessage(`Exported quality report for ${current.name}.`);
  };
  const exportProfileJson = (current: DatasetProfile) => {
    downloadFile(
      `${current.name}-profile.json`,
      "application/json",
      JSON.stringify(current, null, 2),
    );
    setMessage(`Exported ${current.name} profile as JSON.`);
  };

  return (
    <div className="space-y-6">
      <TopBar
        title="Export Center"
        alerts={profile ? profile.missingCells + profile.duplicateRows : 0}
        action={
          <DatasetPicker
            profiles={profiles}
            selectedId={profile?.id ?? null}
            onSelect={setSelectedId}
          />
        }
      />
      <ApiStatus />

      {!profile ? (
        <Card>
          <div className="space-y-4">
            <EmptyState text="Export becomes available after you profile a dataset. Imports never leave your device; exports are generated locally too." />
            <div className="flex justify-center">
              <Link
                href="/import"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-base transition hover:bg-accent/90"
              >
                <Upload className="h-4 w-4" /> Import a CSV
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Profile Summary (CSV)">
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
              <FileText className="h-10 w-10 text-accent" />
              <p className="text-sm text-slate-400">
                Column names, inferred types, null percentages and quality for each column.
              </p>
              <button
                type="button"
                onClick={() => exportProfileSummary(profile)}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-base transition hover:bg-accent/90"
              >
                <Download className="h-4 w-4" /> Download CSV
              </button>
            </div>
          </Card>

          <Card title="Profile Data (JSON)">
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
              <FileJson className="h-10 w-10 text-violet" />
              <p className="text-sm text-slate-400">
                The complete stored profile, suitable for programmatic use or archiving.
              </p>
              <button
                type="button"
                onClick={() => exportProfileJson(profile)}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-violet/20 px-4 py-2.5 text-sm font-semibold text-violet transition hover:bg-violet/30"
              >
                <Download className="h-4 w-4" /> Download JSON
              </button>
            </div>
          </Card>

          <Card title="Quality Report (TXT)">
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
              <FileSpreadsheet className="h-10 w-10 text-warning" />
              <p className="text-sm text-slate-400">
                A readable report of rows, issues and score — useful for sharing with your team.
              </p>
              <button
                type="button"
                onClick={() => exportQualityReport(profile)}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-warning/20 px-4 py-2.5 text-sm font-semibold text-warning transition hover:bg-warning/30"
              >
                <Download className="h-4 w-4" /> Download report
              </button>
            </div>
          </Card>

          <Card title="Status" className="lg:col-span-3">
            <p className="text-sm text-slate-400" role="status">
              {message ??
                "Exports are generated entirely in your browser from the locally stored profile."}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
