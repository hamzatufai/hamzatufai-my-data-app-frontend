"use client";

import type { DatasetProfile } from "@/lib/profiles";

export default function DatasetPicker({
  profiles,
  selectedId,
  onSelect,
}: {
  profiles: DatasetProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (profiles.length === 0) return null;

  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <span className="whitespace-nowrap">Dataset</span>
      <select
        value={selectedId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-200 focus:border-accent focus:outline-none"
        aria-label="Select dataset"
      >
        {[...profiles].reverse().map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name} · {profile.rows.toLocaleString()} rows
          </option>
        ))}
      </select>
    </label>
  );
}
