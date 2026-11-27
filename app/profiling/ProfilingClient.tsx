"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import Card, { EmptyState } from "@/components/Card";
import TopBar from "@/components/TopBar";
import ApiStatus from "@/components/ApiStatus";
import DatasetPicker from "@/components/DatasetPicker";
import { useProfiles } from "@/lib/useProfiles";

const fmt = (n: number) => n.toLocaleString("en-US");

function readingLevel(nullPct: number): { label: string; className: string } {
  if (nullPct === 0) return { label: "Complete", className: "text-accent" };
  if (nullPct <= 2) return { label: "Low missingness", className: "text-accent" };
  if (nullPct <= 10) return { label: "Notable missingness", className: "text-warning" };
  return { label: "High missingness", className: "text-danger" };
}

export default function ProfilingClient() {
  const profiles = useProfiles();
  const [selectedId, setSelectedId] = useState<string | null>(profiles.at(-1)?.id ?? null);

  const profile = useMemo(
    () => profiles.find((p) => p.id === (selectedId ?? profiles.at(-1)?.id)),
    [profiles, selectedId],
  );

  return (
    <div className="space-y-6">
      <TopBar
        title="Data Profiling"
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
            <EmptyState text="No dataset profiles yet. Profile a CSV first — it takes seconds and stays on your device." />
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
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="glass p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Rows</p>
              <p className="mt-2 text-2xl font-semibold text-white">{fmt(profile.rows)}</p>
            </div>
            <div className="glass p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Columns</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.columns.length}</p>
            </div>
            <div className="glass p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Missing cells</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {fmt(profile.missingCells)}
              </p>
            </div>
            <div className="glass p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Quality score</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  profile.quality >= 80
                    ? "text-accent"
                    : profile.quality >= 60
                      ? "text-warning"
                      : "text-danger"
                }`}
              >
                {profile.quality}%
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Column Type Distribution" className="xl:col-span-1">
              {profile.distribution.length === 0 ? (
                <EmptyState text="No type distribution recorded." />
              ) : (
                <ul className="space-y-3 text-sm">
                  {profile.distribution.map((item) => (
                    <li key={item.name} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        {item.name}
                      </span>
                      <span className="flex flex-1 items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${item.value}%`, background: item.color }}
                          />
                        </span>
                        <span className="w-10 text-right text-slate-400">{item.value}%</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title={`Column Detail — ${profile.name}`} className="xl:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="pb-3 font-medium">Column</th>
                      <th className="pb-3 font-medium">Inferred type</th>
                      <th className="pb-3 text-right font-medium">Nulls</th>
                      <th className="pb-3 font-medium">Reading</th>
                      <th className="pb-3 text-right font-medium">Quality</th>
                      <th className="w-32 pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {profile.columns.map((column) => {
                      const reading = readingLevel(column.nullPct);
                      return (
                        <tr key={column.name} className="transition hover:bg-white/[0.02]">
                          <td className="py-3 font-medium text-slate-200">{column.name}</td>
                          <td className="py-3 text-slate-400">{column.type}</td>
                          <td
                            className={`py-3 text-right ${
                              column.nullPct > 10
                                ? "text-danger"
                                : column.nullPct > 2
                                  ? "text-warning"
                                  : "text-slate-400"
                            }`}
                          >
                            {column.nullPct.toFixed(1)}%
                          </td>
                          <td className={`py-3 text-xs ${reading.className}`}>{reading.label}</td>
                          <td className="py-3 text-right text-accent" colSpan={2}>{column.quality}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card title="Notes">
            <p className="text-sm text-slate-400">
              This profile was computed in your browser from the original file. The source data was
              never uploaded. Statistics summarize the dataset as imported; they are not a
              guarantee of completeness or accuracy of the data itself.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
