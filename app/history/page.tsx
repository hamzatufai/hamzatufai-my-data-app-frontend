"use client";

import { CheckCircle2, AlertTriangle, History as HistoryIcon } from "lucide-react";
import Card, { EmptyState } from "@/components/Card";
import TopBar from "@/components/TopBar";
import ApiStatus from "@/components/ApiStatus";
import { useProfiles } from "@/lib/useProfiles";

type Event = {
  when: string;
  timestamp: number;
  dataset: string;
  action: string;
  status: "ok" | "warn";
};

export default function HistoryPage() {
  const profiles = useProfiles();

  const events: Event[] = [...profiles]
    .sort((a, b) => Date.parse(b.importedAt) - Date.parse(a.importedAt))
    .map((profile) => ({
      when: new Date(profile.importedAt).toLocaleString(),
      timestamp: Date.parse(profile.importedAt),
      dataset: profile.name,
      action: `Profiled · ${profile.rows.toLocaleString()} rows · ${profile.columns.length} columns`,
      status: profile.missingCells || profile.duplicateRows ? "warn" : "ok",
    }));

  return (
    <div className="space-y-6">
      <TopBar title="Cleaning History" alerts={events.filter((e) => e.status === "warn").length} />
      <ApiStatus />

      <Card title="Run history (this browser)">
        {events.length === 0 ? (
          <EmptyState text="History records each import and profile run with its timestamp and outcome. Run an import to start your history." />
        ) : (
          <ul className="divide-y divide-line">
            {events.map((event, index) => (
              <li key={event.timestamp + String(index)} className="flex items-center gap-3 py-3 first:pt-0">
                {event.status === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                  {event.dataset} <span className="text-slate-500">— {event.action}</span>
                </span>
                <span className="text-right text-xs text-slate-500">{event.when}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="About history">
        <p className="text-sm text-slate-400">
          <HistoryIcon className="mr-1 inline h-4 w-4 text-accent" />
          History is derived from profiles stored locally in this browser. Clearing your browser
          storage or using another device will not show these records.
        </p>
      </Card>
    </div>
  );
}
