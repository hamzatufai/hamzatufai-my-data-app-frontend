import type { DashboardData } from "@/lib/demo";
import type { DatasetProfile } from "@/lib/profiles";

export function dashboardFromProfiles(profiles: DatasetProfile[]): DashboardData {
  const ordered = [...profiles].sort(
    (a, b) => Date.parse(a.importedAt) - Date.parse(b.importedAt),
  );
  const latest = ordered.at(-1);
  const rows = ordered.reduce((total, profile) => total + profile.rows, 0);
  const weightedQuality = rows
    ? Math.round(
        ordered.reduce((total, profile) => total + profile.quality * profile.rows, 0) / rows,
      )
    : ordered.length
      ? Math.round(ordered.reduce((total, profile) => total + profile.quality, 0) / ordered.length)
      : 0;

  return {
    stats: {
      datasets: ordered.length,
      rows,
      quality: weightedQuality,
      operations: 0,
      activity: ordered.length,
    },
    statSeries: { datasets: [], rows: [], quality: [], operations: [], activity: [] },
    statChange: { datasets: 0, rows: 0, quality: 0, operations: 0, activity: 0 },
    trend: ordered.map((profile, index) => ({
      day: index + 1,
      score: profile.quality,
      timestamp: Date.parse(profile.importedAt),
      label: new Date(profile.importedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    })),
    distribution: latest?.distribution ?? [],
    columns:
      latest?.columns.slice(0, 5).map((column) => ({
        ...column,
        series: [],
      })) ?? [],
    insights: {
      ring: latest?.quality ?? 0,
      openIssues: latest ? latest.missingCells + latest.duplicateRows : 0,
      text: latest
        ? `${latest.missingCells.toLocaleString()} missing values and ${latest.duplicateRows.toLocaleString()} duplicate rows in the latest profile`
        : "",
    },
    cleaning: [],
    weekly: [],
    activity: [...ordered]
      .reverse()
      .slice(0, 8)
      .map((profile) => ({
        name: profile.name,
        action: "Profiled",
        status: profile.missingCells || profile.duplicateRows ? "warn" : "ok",
      })),
    signal: latest
      ? { label: latest.quality >= 80 ? "Good quality" : "Needs review", confidence: latest.quality }
      : { label: "", confidence: 0 },
  };
}
