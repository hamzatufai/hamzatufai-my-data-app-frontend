/**
 * Sample data for the dashboard layout. Only used when
 * NEXT_PUBLIC_DEMO_DATA=true. In production the flag is unset and
 * every panel shows its real empty state.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_DATA === "true";

export type DashboardData = {
  stats: { datasets: number; rows: number; quality: number; operations: number; activity: number };
  statSeries: { datasets: number[]; rows: number[]; quality: number[]; operations: number[]; activity: number[] };
  statChange: { datasets: number; rows: number; quality: number; operations: number; activity: number };
  trend: { day: number; score: number }[];
  distribution: { name: string; value: number; color: string }[];
  columns: { name: string; type: string; nullPct: number; quality: number; series: number[] }[];
  insights: { ring: number; openIssues: number; text: string };
  cleaning: { day: number; cleaned: number; rejected: number }[];
  weekly: { day: string; thisWeek: number; lastWeek: number }[];
  activity: { name: string; action: string; status: "ok" | "warn" }[];
  signal: { label: string; confidence: number };
};

const wave = (n: number, base: number, amp: number, drift: number, phase = 0) =>
  Array.from({ length: n }, (_, i) =>
    Math.round(base + drift * i + amp * Math.sin(i / 3.1 + phase) + amp * 0.5 * Math.sin(i / 7.3 + phase * 2)),
  );

const DEMO: DashboardData = {
  stats: { datasets: 24, rows: 1284930, quality: 78, operations: 146, activity: 38 },
  statSeries: {
    datasets: wave(20, 10, 2, 0.3),
    rows: wave(20, 40, 8, 2, 1),
    quality: wave(20, 70, 4, 0.4, 1),
    operations: wave(20, 60, 10, 1.5, 2),
    activity: wave(20, 20, 6, 0.8, 3),
  },
  statChange: { datasets: 6.21, rows: 5.08, quality: 4.0, operations: 2.45, activity: -1.08 },
  trend: Array.from({ length: 365 }, (_, i) => ({
    day: i,
    score: 60 + Math.round(18 * (i / 365)) + Math.round(4 * Math.sin(i / 9)),
  })),
  distribution: [
    { name: "Text", value: 38, color: "#2ee6a6" },
    { name: "Numeric", value: 27, color: "#3b82f6" },
    { name: "Date", value: 15, color: "#a78bfa" },
    { name: "Boolean", value: 10, color: "#f59e0b" },
    { name: "Other", value: 10, color: "#64748b" },
  ],
  columns: [
    { name: "customer_id", type: "Integer", nullPct: 0.0, quality: 99, series: wave(12, 90, 3, 0.2) },
    { name: "email", type: "Text", nullPct: 2.4, quality: 84, series: wave(12, 80, 4, 0.1, 1) },
    { name: "signup_date", type: "Date", nullPct: 0.8, quality: 91, series: wave(12, 85, 3, -0.1, 2) },
    { name: "amount", type: "Decimal", nullPct: 5.2, quality: 66, series: wave(12, 70, 6, -0.4, 3) },
    { name: "postal_code", type: "Text", nullPct: 1.1, quality: 72, series: wave(12, 75, 5, 0.0, 4) },
  ],
  insights: { ring: 78, openIssues: 12, text: "Strong quality, 12 open issues" },
  cleaning: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    cleaned: 800 + Math.round(300 * Math.sin(i / 4)) + i * 20,
    rejected: 60 + Math.round(40 * Math.cos(i / 3)),
  })),
  weekly: [
    { day: "Mon", thisWeek: 6200, lastWeek: 4100 },
    { day: "Tue", thisWeek: 8100, lastWeek: 5300 },
    { day: "Wed", thisWeek: 7600, lastWeek: 6200 },
    { day: "Thu", thisWeek: 5400, lastWeek: 3900 },
    { day: "Fri", thisWeek: 4800, lastWeek: 5900 },
    { day: "Sat", thisWeek: 3900, lastWeek: 1200 },
    { day: "Sun", thisWeek: 7900, lastWeek: 4700 },
  ],
  activity: [
    { name: "customers.csv", action: "Deduplicate", status: "ok" },
    { name: "orders.xlsx", action: "Profile", status: "ok" },
    { name: "payments.json", action: "Validate", status: "warn" },
  ],
  signal: { label: "Strong Clean", confidence: 78 },
};

const EMPTY: DashboardData = {
  stats: { datasets: 0, rows: 0, quality: 0, operations: 0, activity: 0 },
  statSeries: { datasets: [], rows: [], quality: [], operations: [], activity: [] },
  statChange: { datasets: 0, rows: 0, quality: 0, operations: 0, activity: 0 },
  trend: [],
  distribution: [],
  columns: [],
  insights: { ring: 0, openIssues: 0, text: "" },
  cleaning: [],
  weekly: [],
  activity: [],
  signal: { label: "", confidence: 0 },
};

export const dashboardData: DashboardData = DEMO_MODE ? DEMO : EMPTY;
