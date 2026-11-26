"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card, { EmptyState } from "./Card";

const RANGES = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
];

export default function QualityTrend({ data }: { data: { day: number; score: number; timestamp?: number; label?: string }[] }) {
  const [range, setRange] = useState(1);
  const datedPoints = data.filter((point) => point.timestamp !== undefined);
  const newestTimestamp = datedPoints.reduce(
    (newest, point) => Math.max(newest, point.timestamp ?? 0),
    0,
  );
  const cutoff = newestTimestamp - RANGES[range].days * 24 * 60 * 60 * 1000;
  const sliced =
    datedPoints.length === data.length && datedPoints.length > 0
      ? datedPoints.filter((point) => (point.timestamp ?? 0) >= cutoff)
      : data.slice(-RANGES[range].days);
  const chartData = sliced.map((point) => ({
    ...point,
    label: point.label ?? `Day ${point.day}`,
  }));

  return (
    <Card
      title="Data Quality Performance"
      className="xl:col-span-2 min-h-[340px]"
      right={
        <div className="flex gap-1 rounded-lg bg-white/5 p-1 text-xs">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRange(i)}
              aria-pressed={range === i}
              className={`rounded-md px-2.5 py-1 transition ${
                range === i ? "bg-accent/15 text-accent" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {sliced.length === 0 ? (
        <EmptyState text="Quality trend appears after your first profiled dataset." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="qFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ee6a6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2ee6a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(120,255,220,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip
                contentStyle={{ background: "#0a1222", border: "1px solid rgba(120,255,220,0.15)", borderRadius: 8 }}
                labelFormatter={(d) => String(d)}
                formatter={(v) => [`${v}`, "Quality score"]}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#2ee6a6"
                strokeWidth={2}
                fill="url(#qFill)"
                dot={chartData.length === 1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
